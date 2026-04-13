import EditRecipeClient from './EditRecipeClient'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function EditRecipePage() {
  return <EditRecipeClient />
}
