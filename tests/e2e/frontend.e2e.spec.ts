import path from 'path'
import { test, expect, Page } from '@playwright/test'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

test.describe('Frontend', () => {
  let page: Page
  const baseURL = 'http://localhost:3000'
  const mediaURL = `${baseURL}/admin/collections/media`
  const adminEmail = 'admin@test.com'
  const adminPassword = 'admin'
  const userEmail = 'user@test.com'
  const userPassword = 'user'

  test.beforeAll(async ({ browser, request }) => {
    const context = await browser.newContext()
    page = await context.newPage()
    await createUserAndLogin(request, adminEmail, adminPassword)
    await createRetailerAndDeals(page, page.request)
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto(baseURL)

    await expect(page).toHaveTitle(/Sapyenzs Referido/)

    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('home shows the featured deal', async ({ page }) => {
    await page.goto(baseURL)

    const dealCard = page.locator('a[href="/deals/test-deal"]').first()
    await expect(dealCard).toBeVisible()
  })

  test('can sign up and subsequently login', async ({ page }) => {
    await logoutAndExpectSuccess(page)

    await page.goto(`${baseURL}/create-account`)

    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    const confirmPasswordInput = page.locator('input[name="passwordConfirm"]')
    const email = `test-${Date.now()}@test.com`
    const password = `test`

    await emailInput.fill(email)
    await passwordInput.fill(password)
    await confirmPasswordInput.fill(password)

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    const successMessage = page.locator('text=Cuenta creada exitosamente')
    await expect(successMessage).toBeVisible()

    await logoutAndExpectSuccess(page)
    await loginFromUI(page, email, password)
  })

  test('deals listing shows deals and filters by search', async ({ page }) => {
    await page.goto(`${baseURL}/deals`)

    const dealCard = page.locator('a[href="/deals/test-deal"]').first()
    await expect(dealCard).toBeVisible()

    const searchInput = page.locator('input[name="search"]')
    await searchInput.fill('inexistente-xyz')
    await searchInput.press('Enter')

    await expect(page).toHaveURL(/\/deals\?q=inexistente-xyz/)
    const noResults = page.getByText(/No encontramos ofertas/)
    await expect(noResults).toBeVisible()
  })

  test('deal detail shows prices and outbound CTA points to /go/', async ({ page }) => {
    await page.goto(`${baseURL}/deals/test-deal`)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Test Deal')

    const cta = page.locator('a[href^="/go/"]').first()
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('rel', /sponsored/)
  })

  test('newsletter form subscribes successfully', async ({ page }) => {
    await page.goto(baseURL)

    const form = page.locator('form').filter({ has: page.locator('input[name="email"]') }).last()
    const emailInput = form.locator('input[name="email"]')
    await emailInput.fill(`subscriber-${Date.now()}@test.com`)
    await form.locator('button[type="submit"]').click()

    const successToast = page.getByText(/Te avisaremos cuando haya nuevas ofertas/)
    await expect(successToast).toBeVisible()
  })

  test('authenticated users can view account', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/account`)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Configuración de cuenta')
  })

  test('authenticated users can favorite a deal and see it in /favorites', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/deals/test-deal`)

    const favoriteButton = page.getByRole('button', { name: /Guardar|Guardada/ })
    await expect(favoriteButton).toBeVisible()
    await favoriteButton.click()

    const toast = page.getByText(/favoritos/).first()
    await expect(toast).toBeVisible()

    await page.goto(`${baseURL}/favorites`)
    const favoritedCard = page.locator('a[href="/deals/test-deal"]').first()
    await expect(favoritedCard).toBeVisible()
  })

  test('authenticated users can report an expired deal', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/deals/test-deal`)

    const reportButton = page.getByRole('button', { name: /Reportar oferta vencida/ })
    await reportButton.click()

    const toast = page.getByText(/Revisaremos esta oferta pronto/)
    await expect(toast).toBeVisible()
  })

  test('authenticated customers cannot access /admin', async ({ page }) => {
    await createUserAndLogin(page.request, userEmail, userPassword, false)
    await page.goto(`${baseURL}/admin`)
    const heading = page.locator('h1').first()
    await expect(heading).toContainText('Unauthorized')
  })

  async function createUserAndLogin(
    request: any,
    email: string,
    password: string,
    isAdmin: boolean = true,
  ) {
    const data: any = {
      email,
      password,
    }

    if (isAdmin) {
      data.roles = ['admin']
    }

    await request.post(`${baseURL}/api/users`, {
      data,
    })

    await request.post(`${baseURL}/api/users/login`, {
      data: {
        email,
        password,
      },
    })
  }

  async function createRetailerAndDeals(page: Page, request: any) {
    await loginFromUI(page, adminEmail, adminPassword)

    // Upload a media file for the deal image.
    await page.goto(`${mediaURL}/create`)
    const fileInput = page.locator('input[type="file"]')
    const altInput = page.locator('input[name="alt"]')
    const filePath = path.resolve(dirname, '../../public/web-app-manifest-192x192.png')
    await fileInput.setInputFiles(filePath)
    await altInput.fill('Test Image')
    const uploadButton = page.locator('#action-save')
    await uploadButton.click()
    await expect(page).toHaveURL(/\/admin\/collections\/media\/\d+/)
    const imageID = page.url().split('/').pop()

    const retailer = await request.post(`${baseURL}/api/retailers`, {
      data: {
        name: 'Test Retailer',
        slug: 'test-retailer',
        websiteUrl: 'https://example.com',
        affiliateTagTemplate: '{url}?tag=test-20',
        defaultCurrency: 'COP',
        active: true,
      },
    })

    const retailerID = (await retailer.json()).doc.id

    await request.post(`${baseURL}/api/deals`, {
      data: {
        title: 'Test Deal',
        slug: 'test-deal',
        image: Number(imageID),
        retailer: retailerID,
        originalPrice: 100000,
        dealPrice: 75000,
        currency: 'COP',
        affiliateUrl: 'https://example.com/p/test',
        featured: true,
        _status: 'published',
      },
    })
  }

  async function logoutAndExpectSuccess(page: Page) {
    await page.goto(`${baseURL}/logout`)
    const heading = page.locator('h1').first()
    await expect(heading).toContainText(/Sesión cerrada|cerrado sesión/i)
  }

  async function loginFromUI(page: Page, email: string, password: string) {
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await page.goto(`${baseURL}/login`)
    await emailInput.fill(email)
    await passwordInput.fill(password)
    await submitButton.click()
    await page.waitForURL(/\/account/)
  }
})
