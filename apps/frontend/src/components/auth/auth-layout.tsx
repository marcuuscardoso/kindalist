import { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="kl-auth">
      <aside className="kl-auth-aside" aria-label="Kindalist">
        <div className="kl-auth-brand">
          <div className="kl-auth-mark">k.</div>
          <div>
            <div className="kl-auth-brand-name">Kinda List</div>
            <div className="kl-auth-brand-sub">tasks, sort of.</div>
          </div>
        </div>

        <div className="kl-auth-hero">
          Um app de tarefas que faz <s>tudo</s>
          <br />o suficiente.
          <em>// projeto de teste técnico, com carinho.</em>
        </div>

        <blockquote className="kl-auth-quote">
          “Uma lista de tarefas honesta sobre não ser perfeita
          <br />
          já é melhor que metade dos apps que tentam ser.”
          <strong>— ninguém em particular</strong>
        </blockquote>
      </aside>

      <section className="kl-auth-form">{children}</section>
    </main>
  )
}
