import { test, expect, type Page, type BrowserContext } from '@playwright/test';

// __________________________________________________________
// КОНСТАНТЫ — тестовые данные (что именно проверяем)
// __________________________________________________________
// Имена — то, что видит ПОЛЬЗОВАТЕЛЬ на экране.
// ID — то, что приложение отправляет на СЕРВЕР в запросе.
// в UI ищем по NAME, тело запроса сверяем — по ID.
const BUN_NAME = 'Краторная булка N-200i';
const BUN_ID = 'bun-1';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const MAIN_ID = 'main-1';
const SAUCE_NAME = 'Соус Spicy-X';
const SAUCE_ID = 'sauce-1';

// __________________________________________________________
// HELPER: авторизация + сборка бургера
// __________________________________________________________
// Вызывается ВНУТРИ тестов заказа,
// чтобы не дублировать один и тот же код «логин + собрать бургер» трижды.

async function setupAuthorizedOrder(
  page: Page,
  context: BrowserContext,
  baseUrl: string
): Promise<void> {
  // Cookie ставится на домен приложения (baseUrl), а не API — приложение читает её со своего домена.
  // Значение кодируется через encodeURIComponent — приложение декодирует его обратно.
  await context.addCookies([
    {
      name: 'accessToken',
      value: encodeURIComponent('Bearer fake-access-token'),
      url: baseUrl,
    }
  ]);

  // refreshToken кладём до загрузки страницы через addInitScript.
  await page.addInitScript(() => localStorage.setItem('refreshToken', 'fake-refresh-token'));

  // Ловушка регистрируется до goto: запрос /api/auth/user уходит при загрузке приложения.
  const userResponse = page.waitForResponse((response) => response.url().endsWith('/api/auth/user'));

  await page.goto('/');

  // Ответ 200 = пользователь авторизован.
  expect((await userResponse).status()).toBe(200);

  // Поиск ингредиента: li с нужным именем → кнопка «Добавить» внутри него.
  const add = (name: string) =>
    page.locator('li').filter({ hasText: name })
    .getByRole('button', { name: 'Добавить', exact: true})
    .click();

  // Порядок добавления = порядок в массиве ingredients при заказе:
  // булка → начинка → соус → булка (булка внизу добавляется автоматически).
  await add(BUN_NAME);
  await add(MAIN_NAME);
  await add(SAUCE_NAME);
}

// __________________________________________________________
// ОБЩИЙ beforeEach — для ВСЕХ тестов файла:
// запросы к /api/** отдаются из HAR, без реального бэкенда.
// __________________________________________________________

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR('./tests/hars/api.har', {
    url: '**/api/**',  // перехватываются только запросы к API
    notFound: 'abort', // запроса нет в HAR — соединение обрывается
    update: false,     // HAR не перезаписывается, только читается
  });
});

// __________________________________________________________
// ТЕСТЫ
// __________________________________________________________
test.describe('Загрузка ингредиентов на странице конструктора', () => {
  test('отображает ингредиенты после загрузки', async ({ page }) => {
    await page.goto('/');

    // Ингредиенты загрузились
    // .first() — имя может встречаться в нескольких местах на странице.
    await expect(page.getByText(BUN_NAME).first()).toBeVisible();
    await expect(page.getByText(MAIN_NAME).first()).toBeVisible();
    await expect(page.getByText(SAUCE_NAME).first()).toBeVisible();
  });
});

// __________________________________________________________
test.describe('Конструктор бургера в пустом состоянии', () => {
  test('показывает заглушки и нулевую сумму при старте', async ({ page }) => {
    await page.goto('/');

    // Ищем внутри конструктора — так локаторы не пересекаются с другими блоками.
    const constructor = page.getByTestId('constructor');

    // Проверяем исходное (пустое) состояние конструктора:
    // заглушки на месте, булок нет, сумма равна нулю.
    await expect(constructor.getByText('Выберите булки')).toHaveCount(2); // заглушка «Выберите булки» показывается дважды (верх и низ)
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
    await expect(page.getByTestId('constructor-bun-1')).toHaveCount(0); // элемента нет
    await expect(page.getByTestId('constructor-bun-2')).toHaveCount(0);
    await expect(constructor.getByTestId('order-summ')).toContainText('0'); // реальный текст может быть «0 ₽»
  });
});

// __________________________________________________________
test.describe('Добавление ингредиентов в конструктор', () => {
  test('добавляет булку в конструктор и обновляет сумму', async ({ page }) => {
    await page.goto('/');

    const constructor = page.getByTestId('constructor');

    // до клика - булки в конструкторе нет — фиксируем «состояние до».
    await expect(page.getByTestId('constructor-bun-1')).toHaveCount(0);

    // Кнопка «Добавить» есть у каждого ингредиента, поэтому сначала находим li с именем.
    await page
      .locator('li')
      .filter({ hasText: BUN_NAME })
      .getByRole('button', { name: 'Добавить', exact: true })
      .click();

    // После клика булка отображается сразу в двух местах: верх (bun-1) и низ (bun-2).
    await expect(constructor.getByTestId('constructor-bun-1')).toBeVisible();
    await expect(constructor.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(constructor.getByTestId('constructor-bun-2')).toBeVisible();
    await expect(constructor.getByText(`${BUN_NAME} (низ)`)).toBeVisible();

    // Булка считается за две штуки: 1255 × 2 = 2510.
    await expect(constructor.getByTestId('order-summ')).toContainText('2510');
  });

  test('добавляет начинку в конструктор и обновляет сумму', async ({ page }) => {
    await page.goto('/');

    const constructor = page.getByTestId('constructor');

    // до клика - начинки в контейнере нет — фиксируем «состояние до».
    await expect(
      constructor.getByTestId('constructor-ingredients').getByText(MAIN_NAME, { exact: true })
    ).toHaveCount(0);

    // Кнопка «Добавить» есть у каждого ингредиента, поэтому сначала находим li с именем.
    await page
      .locator('li')
      .filter({ hasText: MAIN_NAME })
      .getByRole('button', { name: 'Добавить', exact: true })
      .click();

    // После клика начинка появляется в отдельном контейнере constructor-ingredients.
    await expect(
      constructor
        .getByTestId('constructor-ingredients')
        .getByText(MAIN_NAME, { exact: true })
    ).toBeVisible();

    // Без булки сумма равна стоимости одной начинки — 424.
    await expect(constructor.getByTestId('order-summ')).toContainText('424');
  });
});

// __________________________________________________________
test.describe('Модальное окно ингредиента', () => {
  test('открывается по клику и показывает данные выбранного ингредиента', async ({ page }) => {
    await page.goto('/');

    const modal = page.getByRole('dialog');
    await expect(modal).toHaveCount(0); // модалки ещё нет

    // Ингредиент — ссылка: клик открывает модалку и меняет URL на `/ingredients/main-1`.
    await page.getByRole('link', { name: MAIN_NAME }).click();

    // После клика модалка появилась.
    await expect(modal).toBeVisible();
    // RegExp: важно, что путь заканчивается на /ingredients/main-1.
    await expect(page).toHaveURL(new RegExp(`/ingredients/${MAIN_ID}$`));
    // Модалка содержит заголовок выбранного ингредиента.
    await expect(
      modal.getByRole('heading', { name: MAIN_NAME, exact: true })
    ).toBeVisible();
    // В модалке нет заголовка с булкой -> открыт нужный ингредиент.
    await expect(
      modal.getByRole('heading', { name: BUN_NAME, exact: true })
    ).toHaveCount(0);
  });

  test('закрывается по клику на кнопку крестик', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: MAIN_NAME }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible(); // состояние до — модалка открыта.

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    // После клика модалка и оверлей исчезают, URL возвращается к `/`.
    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: MAIN_NAME }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible(); // состояние до — модалка открыта.

    // Клик по углу оверлея: в центре лежит модалка, она перехватила бы клик.
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });

    // После клика модалка и оверлей исчезают, URL возвращается к `/`.
    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается по Escape', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: MAIN_NAME }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible(); // состояние до — модалка открыта.

    // Клик по заголовку переводит фокус внутрь модалки, чтобы отработал Escape.
    await page.getByRole('heading', { name: 'Детали ингредиента' }).click();
    await page.keyboard.press('Escape');

    // После нажатия модалка и оверлей исчезают, URL возвращается к `/`.
    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

// __________________________________________________________
test.describe('Создание заказа', () => {
  test('отправляет заказ с правильным составом ингредиентов', async ({ page, context, baseURL }) => {
    // baseURL! — указываем TypeScript, что значение задано в конфиге.
    await setupAuthorizedOrder(page, context, baseURL!); // юзер уже проверен внутри helper

    // Ловушка на POST-запрос регистрируется до клика. Проверяются и URL, и метод.
    const orderRequest = page.waitForRequest(
      (request) => request.url().endsWith('/api/orders') && request.method() === 'POST',
      { timeout: 5000 }
    );

    // Клик запускает запрос, на который подписана ловушка.
    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();

    const request = await orderRequest;
    // postDataJSON() возвращает тело запроса объектом. Булка занимает первую и последнюю позиции.
    expect(request.postDataJSON()).toEqual({
      ingredients: [BUN_ID, MAIN_ID, SAUCE_ID, BUN_ID],
    });
  });

  test('показывает модалку с верным номером заказа', async ({ page, context, baseURL }) => {
    await setupAuthorizedOrder(page, context, baseURL!);

    const modal = page.getByRole('dialog');
    await expect(modal).toHaveCount(0); // состояние до — модалки нет.

    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();

    await expect(modal).toBeVisible(); // После оформления модалка появилась.

    // Номер берётся из HAR-ответа. exact: true — чтобы не поймать подстроку.
    await expect(modal.getByText('123456', { exact: true })).toBeVisible();
  });

  test('очищает конструктор после оформления', async ({ page, context, baseURL }) => {
    await setupAuthorizedOrder(page, context, baseURL!);

    const modal = page.getByRole('dialog');
    const constructor = page.getByTestId('constructor');

    // состояние до — модалки нет, но в конструкторе собран бургер.
    await expect(modal).toHaveCount(0);
    await expect(constructor.getByTestId('constructor-bun-1')).toBeVisible();

    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();

    // Модалка с номером — сигнал, что заказ прошёл; после этого проверяется очистка.
    await expect(modal).toBeVisible();

    // После заказа конструктор возвращается в исходное пустое состояние.
    await expect(constructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
    await expect(constructor.getByTestId('constructor-bun-1')).toHaveCount(0);
    await expect(constructor.getByTestId('constructor-bun-2')).toHaveCount(0);
    await expect(constructor.getByTestId('order-summ')).toContainText('0');
  });

  test('закрывает модалку заказа и проверяет успешность закрытия', async ({ page, context, baseURL }) => {
    await setupAuthorizedOrder(page, context, baseURL!);

    const modal = page.getByRole('dialog');

    // состояние до — модалки нет.
    await expect(modal).toHaveCount(0);

    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();

    // после оформления модалка открылась, номер верный.
    await expect(modal).toBeVisible();
    await expect(modal.getByText('123456', { exact: true })).toBeVisible();

    // закрываем модалку
    await modal.getByRole('button', { name: 'Закрыть' }).click();

    // после закрытия модалка и оверлей исчезают.
    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
  });
});
