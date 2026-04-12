###############################################
# Frontend Build (Next.js - Standalone Mode)
###############################################
FROM --platform=$BUILDPLATFORM node:20-slim AS frontend-builder

WORKDIR /frontend

# Copy package files first for caching
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --prefer-offline --no-audit --no-fund

# Copy frontend source
COPY frontend .

# Build standalone application
RUN npm run build && \
    cp -r .next/static .next/standalone/.next/ 2>/dev/null || true

###############################################
# Base Image - Python
###############################################
FROM python:3.12-slim@sha256:7026274c107626d7e940e0e5d6730481a4600ae95d5ca7eb532dd4180313fea9 \
    AS python-base

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
# Backend Package Build
###############################################
FROM python-base AS backend-builder
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

WORKDIR /mealie

COPY uv.lock pyproject.toml ./
COPY mealie ./mealie

# Build the source and binary package
RUN uv build --out-dir dist

# Create the requirements file
RUN uv export --no-editable --no-emit-project --extra pgsql --format requirements-txt --output-file dist/requirements.txt \
    && MEALIE_VERSION=$(python -c "import tomllib; print(tomllib.load(open('pyproject.toml', 'rb'))['project']['version'])") \
    && echo "mealie[pgsql]==${MEALIE_VERSION} \\" >> dist/requirements.txt \
    && pip hash dist/mealie-${MEALIE_VERSION}-py3-none-any.whl | tail -n1 | tr -d '\n' >> dist/requirements.txt \
    && echo " \\" >> dist/requirements.txt \
    && pip hash dist/mealie-${MEALIE_VERSION}.tar.gz | tail -n1 >> dist/requirements.txt

###############################################
# Package Container
###############################################
FROM scratch AS packages
COPY --from=backend-builder /mealie/dist /

###############################################
# Python Virtual Environment Build
###############################################
FROM python-base AS venv-builder-base
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    build-essential \
    libpq-dev \
    libwebp-dev \
    ffmpeg \
    libsasl2-dev libldap2-dev libssl-dev \
    gnupg gnupg2 gnupg1 \
    && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv --upgrade-deps $VENV_PATH

FROM venv-builder-base AS venv-builder

COPY --from=packages * /dist/

RUN . $VENV_PATH/bin/activate \
    && pip install --require-hashes -r /dist/requirements.txt --find-links /dist

###############################################
# Production Image (Backend + Frontend Runner)
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
RUN mkdir -p $NLTK_DATA
RUN python -m nltk.downloader -d $NLTK_DATA averaged_perceptron_tagger_eng

VOLUME [ "$MEALIE_HOME/data/" ]
ENV APP_PORT=9000

EXPOSE ${APP_PORT}

COPY ./docker/healthcheck.sh $MEALIE_HOME/healthcheck.sh
RUN chmod +x $MEALIE_HOME/healthcheck.sh
HEALTHCHECK CMD $MEALIE_HOME/healthcheck.sh

ENV HOST=0.0.0.0

EXPOSE ${APP_PORT}
COPY ./docker/entry.sh $MEALIE_HOME/run.sh

RUN chmod +x $MEALIE_HOME/run.sh
ENTRYPOINT ["/app/run.sh"]

###############################################
# Frontend Only Image (Optional)
###############################################
FROM node:20-slim AS frontend-production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone output from builder
COPY --from=frontend-builder /frontend/public ./public
COPY --from=frontend-builder /frontend/.next/standalone ./
COPY --from=frontend-builder /frontend/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "server.js"]
