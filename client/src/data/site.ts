/* ============================================================
   Контент сайта. Тексты — из «текст, шрифт, цвета.docx» и макета.
   Плейсхолдеры помечены TODO — заменить перед публикацией.
   ============================================================ */

export const contacts = {
  brand: 'Помогариум',
  brandTagline: 'онлайн-репетиторы', // подпись под логотипом
  phone: '+7 963 349-77-27',
  phoneHref: 'tel:+79633497727',
  // TODO: заменить на реальные ссылки
  telegram: 'https://t.me/username',
  whatsapp: 'https://wa.me/79633497727',
  max: 'https://max.ru/username',
  email: 'hello@pomogarium.ru', // TODO
}

export const nav = [
  { label: 'О нас', href: '#advantages' },
  { label: 'Предметы', href: '#subjects' },
  { label: 'Преподаватели', href: '#teachers' },
  { label: 'Контакты', href: '#contacts' },
]

export const advantages = [
  {
    icon: 'hourglass' as const,
    title: '5 лет',
    text: 'подбираем репетиторов',
  },
  {
    icon: 'palette' as const,
    title: 'Все предметы',
    text: '1–11 класс, ОГЭ и ЕГЭ',
  },
  {
    icon: 'laptop' as const,
    title: 'Онлайн обучение',
    text: 'удобно, безопасно и доступно из любой точки мира',
  },
  {
    icon: 'handshake' as const,
    title: 'Индивидуальный подход',
    text: 'не по шаблону — с учётом особенностей ученика',
  },
]

export const steps = [
  {
    n: 1,
    icon: 'bell' as const,
    title: 'Оставляете заявку',
    text: 'Расскажите нам, для чего нужны уроки и по каким предметам',
  },
  {
    n: 2,
    icon: 'user' as const,
    title: 'Подбираем репетитора',
    text: 'С учётом целей, уровня и ваших пожеланий',
  },
  {
    n: 3,
    icon: 'check' as const,
    title: 'Начинаете занятия',
    text: 'Удобный график и поддержка на каждом этапе',
  },
]

export const subjects = [
  'Математика',
  'Русский язык',
  'Английский язык',
  'Химия',
  'Информатика',
  'Литература',
  'Китайский язык',
  'Биология',
  'Физика',
  'История',
  'Обществознание',
  'И другие предметы',
] as const

export const teacherCategories = [
  {
    title: 'Начинающий специалист',
    text: 'Современный подход, энергия, интересная подача.',
    exp: 'опыт 1–2 года',
  },
  {
    title: 'Опытный педагог',
    text: 'Уже есть практика и результаты, уверенно работают со школьной программой.',
    exp: 'опыт 3–4 года',
  },
  {
    title: 'Эксперт',
    text: 'Сильные результаты, подготовка к сложным экзаменам.',
    exp: 'опыт от 5 лет',
  },
]

export type Teacher = {
  name: string
  subject: string
  experience: string
  photo: string | null
}

export const teachers: Teacher[] = [
  {
    name: 'Алина',
    subject: 'английский язык',
    experience: 'преподаёт 2 года',
    photo: '/images/teacher-alina.jpg',
  },
  {
    name: 'Анастасия',
    subject: 'русский язык и литература',
    experience: 'преподаёт 4 года',
    photo: null, // TODO: положить фото в client/public/images/teacher-anastasia.jpg и указать путь
  },
  // TODO: добавить остальных преподавателей — просто дописать объекты сюда:
  // { name: 'Имя', subject: 'предмет', experience: 'преподаёт N лет', photo: '/images/teacher-xxx.jpg' },
]

// 12 скринов отзывов из Telegram (client/public/reviews/1..12.jpg)
export const reviews = Array.from({ length: 12 }, (_, i) => ({
  src: `/reviews/${i + 1}.jpg`,
  alt: `Отзыв ученика №${i + 1}`,
}))

export const footer = {
  // TODO: заменить плейсхолдеры на реальные данные
  address: 'г. Москва', // TODO
  year: new Date().getFullYear(),
  legalName: 'Помогариум', // TODO: ИП/самозанятость, ИНН
  qrNote: 'QR-коды на мессенджеры — добавить', // TODO: залепить реальные QR
}
