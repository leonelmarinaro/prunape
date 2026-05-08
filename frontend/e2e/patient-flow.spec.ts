import { test, expect } from '@playwright/test'

// NOTA: estos tests requieren backend corriendo en localhost:8000
// Para CI: ejecutar `docker-compose up -d` o `uvicorn backend.main:app` antes de correr
// Si el backend no está disponible, los tests se saltean automáticamente
test.skip(!process.env.BACKEND_AVAILABLE, 'Requiere backend corriendo en localhost:8000')

test.describe('Flujo de paciente', () => {
  test.beforeEach(async ({ page }) => {
    // Si hay Clerk configurado, esto requiere autenticación.
    // En modo dev sin VITE_CLERK_PUBLISHABLE_KEY, la app carga directamente.
    await page.goto('/')
  })

  test('página principal carga correctamente', async ({ page }) => {
    await expect(page.locator('text=PRUNAPE')).toBeVisible({ timeout: 5000 })
  })

  test('navegar a lista de pacientes', async ({ page }) => {
    await page.goto('/patients')
    // Verificar que la página carga (tabla o estado vacío)
    await expect(
      page.locator('table').or(page.locator('text=No se encontraron pacientes'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('buscar paciente existente', async ({ page }) => {
    await page.goto('/patients')
    const input = page.getByPlaceholder(/Buscar/)
    await expect(input).toBeVisible()
    await input.fill('Test')
    // Esperar el debounce (300ms)
    await page.waitForTimeout(400)
    // Verificar que la tabla actualiza (no lanza error)
    await expect(
      page.locator('table').or(page.locator('text=No se encontraron'))
    ).toBeVisible()
  })

  test('crear paciente y crear pesquisa', async ({ page }) => {
    // Ir a crear paciente
    await page.goto('/patients/new')
    await expect(page.locator('h1, h2').first()).toBeVisible()

    await page.fill('[name="name"]', 'Paciente Test E2E')
    await page.fill('[name="birth_date"]', '2022-01-01')
    await page.click('[type="submit"]')

    // Verificar redirección a lista o detalle
    await page.waitForURL(/\/patients/, { timeout: 5000 })

    // Buscar el paciente creado
    await expect(page.locator('text=Paciente Test E2E')).toBeVisible({ timeout: 5000 })

    // Ir al detalle y crear pesquisa
    await page.click('text=Paciente Test E2E')
    await page.waitForURL(/\/patients\/\d+/)

    // Verificar que hay botón de nueva pesquisa
    const nuevaPesquisaBtn = page.locator('[data-testid="nueva-pesquisa"], a[href*="assess"], button:has-text("Nueva")')
    await expect(nuevaPesquisaBtn.first()).toBeVisible({ timeout: 3000 })
  })

  test('wizard de pesquisa carga correctamente', async ({ page }) => {
    // Navegar directamente al wizard (si existe paciente 1)
    await page.goto('/patients/1/assess')
    // Verificar que la página carga sin error crítico
    await expect(
      page.locator('text=Paso').or(page.locator('[role="tablist"]')).or(page.locator('text=Cargando'))
    ).toBeVisible({ timeout: 5000 })
  })
})
