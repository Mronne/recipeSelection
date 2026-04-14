###############################################
# ARM64 Optimized Dockerfile
# frontend-builder & backend-builder use BUILDPLATFORM
# for fast native compilation on CI runners
###############################################
ARG BUILDPLATFORM

###############################################
# Frontend Build (Next.js - Export Mode)
# Runs on BUILDPLATFORM for fast npm build
###############################################
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/devcontainers/javascript-node:20 AS frontend-builder

WORKDIR /frontend

# Copy package files first for caching
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy frontend source
COPY frontend .

# Build static export
RUN npm run build

###############################################
# Backend Package Build
# Runs on BUILDPLATFORM for fast Python wheel build
###############################################
FROM --platform=$BUILDPLATFORM python:3.12-slim AS backend-builder

RUN apt-get update \
    && apt-get install --no-install-recommends -y curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

WORKDIR /mealie

COPY uv.lock pyproject.toml ./
COPY mealie ./mealie

# Build the source and binary package
RUN uv build --out-dir dist

# Create the requirements file (no hashes for faster build)
RUN uv export --no-editable --no-emit-project --extra pgsql --format requirements-txt --output-file dist/requirements.txt \
    && MEALIE_VERSION=$(python -c "import tomllib; print(tomllib.load(open('pyproject.toml', 'rb'))['project']['version'])") \
    && printf 'mealie[pgsql]==%s\n' "$MEALIE_VERSION" >> dist/requirements.txt

###############################################
# Package Container
###############################################
FROM scratch AS packages
COPY --from=backend-builder /mealie/dist /

###############################################
# Base Image - Python (TARGETPLATFORM)
###############################################
FROM python:3.12-slim AS python-base

ENV MEALIE_HOME="/app"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    VENV_PATH="/opt/mealie"

ENV PATH="$VENV_PATH/bin:$PATH"

RUN useradd -u 911 -U -d $MEALIE_HOME -s /bin/bash abc \
    && usermod -G users abc \
    && mkdir $MEALIE_HOME

###############################################
# Python Virtual Environment Build (TARGETPLATFORM)
###############################################
FROM python-base AS venv-builder-base
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    build-essential \
    libpq-dev \
    libsasl2-dev libldap2-dev libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv --upgrade-deps $VENV_PATH \
    && pip install uv

FROM venv-builder-base AS venv-builder

COPY --from=packages * /dist/

RUN . $VENV_PATH/bin/activate \
    && uv pip install -r /dist/requirements.txt --find-links /dist

###############################################
# Production Image (Backend + Frontend)
###############################################
FROM python-base AS production
ENV PRODUCTION=true
ENV TESTING=false

ARG COMMIT
ENV GIT_COMMIT_HASH=$COMMIT

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    curl \
    ffmpeg \
    gosu \
    iproute2 \
    libldap-common \
    libldap2 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /run/secrets

COPY --from=venv-builder $VENV_PATH $VENV_PATH

ENV NLTK_DATA="/nltk_data/"
RUN mkdir -p $NLTK_DATA \
    && python -m nltk.downloader -q -d $NLTK_DATA averaged_perceptron_tagger_eng \
    || echo "Warning: nltk data download failed, continuing build"

# Copy frontend static files to be served by backend SPA
COPY --from=frontend-builder /frontend/dist /app/mealie/frontend

VOLUME [ "$MEALIE_HOME/data/" ]
ENV STATIC_FILES=/app/mealie/frontend
ENV APP_PORT=9000

EXPOSE ${APP_PORT}

COPY ./docker/healthcheck.sh $MEALIE_HOME/healthcheck.sh
RUN chmod +x $MEALIE_HOME/healthcheck.sh
HEALTHCHECK CMD $MEALIE_HOME/healthcheck.sh

ENV HOST=0.0.0.0

COPY ./docker/entry.sh $MEALIE_HOME/run.sh
RUN chmod +x $MEALIE_HOME/run.sh
ENTRYPOINT ["/app/run.sh"]
