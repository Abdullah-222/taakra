const SETTINGS_SECTIONS = [
  { title: 'General', desc: 'Site name, logo, and default options' },
  { title: 'Notifications', desc: 'Email and in-app notification preferences' },
  { title: 'Security', desc: 'Session timeout, 2FA, and login rules' },
  { title: 'Integrations', desc: 'Resend, Stripe, 100ms, and other services' },
]

export default function AdminSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Settings</h1>
      <p className="text-stone-600 dark:text-gray-400 mb-8">
        Configure your application. This is a placeholder for future settings.
      </p>
      <div className="space-y-6 max-w-2xl">
        {SETTINGS_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-1">{section.title}</h2>
            <p className="text-sm text-stone-600 dark:text-gray-400 mb-4">{section.desc}</p>
            <button
              type="button"
              disabled
              className="px-4 py-2 bg-stone-100 dark:bg-gray-700 text-stone-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              Coming soon
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
