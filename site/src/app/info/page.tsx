import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Покупателям",
  description: "Доставка, оплата, возврат, оферта и политика персональных данных магазина TMFF.",
  alternates: { canonical: "/info" },
};

// Черновик: [в квадратных скобках] — заполнить реквизитами ИП. Тексты оферты и политики проверить с юристом.
const SECTIONS = [
  {
    id: "delivery",
    title: "Доставка и оплата",
    body: [
      "Отправляем по всей России. Срок доставки указан на карточке товара — обычно 12–25 дней. После отправки пришлём трек-номер.",
      "Оплата картой или по СБП через ЮKassa. Чек придёт на почту, указанную в заказе.",
      "Товары едут со складов поставщиков напрямую к вам. Если в одном заказе несколько товаров, они могут прийти разными посылками.",
    ],
  },
  {
    id: "returns",
    title: "Возврат и обмен",
    body: [
      "Товар надлежащего качества можно вернуть в течение 7 дней после получения, если сохранены вид и упаковка (ст. 26.1 Закона «О защите прав потребителей»).",
      "Если товар пришёл с браком или не соответствует описанию — напишите нам в течение срока, установленного законом, приложите фото. Вернём деньги или заменим товар.",
      "Для возврата напишите нам в Telegram или на почту [email] — пришлём адрес и инструкцию.",
    ],
  },
  {
    id: "offer",
    title: "Публичная оферта",
    body: [
      "Продавец: ИП [ФИО], ИНН [—], ОГРНИП [—], адрес: [—].",
      "Оформляя заказ, покупатель принимает условия оферты: описание товара, цена, порядок оплаты, доставки и возврата указаны на сайте. [Полный текст оферты — добавить.]",
      "Товары с пометкой «Реплика» не являются продукцией команд, LEGO или других правообладателей и не лицензированы ими.",
    ],
  },
  {
    id: "privacy",
    title: "Политика персональных данных",
    body: [
      "Оператор персональных данных — ИП [ФИО]. Мы собираем только данные, нужные для заказа: имя, телефон, email, адрес доставки.",
      "Данные используются для доставки, отправки чека и связи по заказу. Передаются только службе доставки и платёжному сервису.",
      "Отозвать согласие или запросить удаление данных можно по адресу [email]. [Полный текст политики — добавить.]",
    ],
  },
  {
    id: "contacts",
    title: "Контакты",
    body: ["Telegram: [ссылка]", "Email: [email]", "ИП [ФИО], ИНН [—], ОГРНИП [—]"],
  },
];

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-paper px-5 py-8 text-paper-ink md:px-[5vw] md:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
        <ArrowLeft className="size-4" /> В магазин
      </Link>
      <h1 className="mt-10 font-display text-6xl font-bold uppercase leading-none md:text-8xl">Покупателям</h1>
      <nav aria-label="Разделы" className="mt-8 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full px-4 py-2 text-sm ring-1 ring-black/15 hover:ring-paper-ink">
            {s.title}
          </a>
        ))}
      </nav>
      <div className="mt-12 flex max-w-3xl flex-col gap-14">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-8">
            <h2 className="font-display text-3xl font-bold uppercase">{s.title}</h2>
            <div className="mt-4 flex flex-col gap-3 leading-relaxed text-paper-ink/80">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
