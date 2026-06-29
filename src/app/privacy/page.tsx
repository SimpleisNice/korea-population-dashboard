import type { Metadata } from 'next'
import Link from 'next/link'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '인구통계 서비스의 개인정보처리방침입니다.',
}

export default function PrivacyPage() {
  return (
    <MobileShell>
      <Header title="개인정보처리방침" showBack backHref="/" />

      <article style={{ padding: '20px 16px 48px' }}>
        <div
          className="rounded-xl"
          style={{
            backgroundColor: 'var(--color-bg)',
            boxShadow: 'var(--shadow-card)',
            padding: '24px 20px',
          }}
        >
          <h1
            className="text-lg font-bold"
            style={{ color: 'var(--color-text-primary)', marginBottom: 8 }}
          >
            개인정보처리방침
          </h1>
          <p
            className="text-[13px]"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}
          >
            시행일: 2026년 6월 30일
          </p>

          <Section title="1. 수집하는 개인정보 항목">
            <p>
              본 서비스(&quot;인구통계&quot;, 이하 &quot;서비스&quot;)는 별도의 회원가입 절차 없이 이용할 수 있으며,
              이용자로부터 직접적으로 개인정보를 수집하지 않습니다.
            </p>
            <p>
              다만, 서비스 이용 과정에서 아래와 같은 정보가 자동으로 생성·수집될 수 있습니다.
            </p>
            <ul>
              <li>방문 기록, 접속 IP, 브라우저 종류, 접속 시간</li>
              <li>쿠키(Cookie)를 통한 이용 행태 정보</li>
            </ul>
          </Section>

          <Section title="2. 개인정보의 이용 목적">
            <p>수집된 정보는 다음의 목적으로만 사용됩니다.</p>
            <ul>
              <li>서비스 이용 통계 분석 및 서비스 개선</li>
              <li>Google 애드센스를 통한 맞춤형 광고 제공</li>
            </ul>
          </Section>

          <Section title="3. 쿠키(Cookie) 사용">
            <p>
              본 서비스는 Google 애드센스 광고를 게재하며, Google 및 제3자 광고 네트워크는
              쿠키를 사용하여 이용자의 관심사에 기반한 광고를 제공할 수 있습니다.
            </p>
            <p>
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며,
              쿠키 거부 시 맞춤형 광고가 제한될 수 있습니다.
            </p>
            <ul>
              <li>
                Google의 광고 쿠키 사용에 대한 자세한 내용은{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
                >
                  Google 광고 정책
                </a>
                을 참고하세요.
              </li>
              <li>
                맞춤 광고를 원하지 않는 경우{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
                >
                  Google 광고 설정
                </a>
                에서 비활성화할 수 있습니다.
              </li>
            </ul>
          </Section>

          <Section title="4. 개인정보의 보유 및 파기">
            <p>
              본 서비스는 이용자의 개인정보를 별도로 저장하지 않으며,
              자동 수집되는 로그 데이터는 통계 분석 후 지체 없이 파기합니다.
            </p>
          </Section>

          <Section title="5. 개인정보의 제3자 제공">
            <p>
              본 서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, Google 애드센스를 통해 광고 목적의 쿠키 정보가 Google에 전달될 수 있습니다.
            </p>
          </Section>

          <Section title="6. 이용자의 권리">
            <p>이용자는 다음과 같은 권리를 행사할 수 있습니다.</p>
            <ul>
              <li>브라우저 설정을 통한 쿠키 수집 거부</li>
              <li>Google 광고 설정을 통한 맞춤 광고 비활성화</li>
              <li>개인정보 관련 불만 처리 요청</li>
            </ul>
          </Section>

          <Section title="7. 데이터 출처" last>
            <p>
              본 서비스에서 제공하는 인구 통계 데이터는 행정안전부 주민등록 인구통계
              공개 데이터를 기반으로 하며, 개인을 식별할 수 없는 집계 데이터입니다.
            </p>
          </Section>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link
            href="/"
            className="text-[13px] font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            홈으로 돌아가기
          </Link>
        </div>
      </article>
    </MobileShell>
  )
}

function Section({
  title,
  children,
  last,
}: {
  title: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <section style={{ marginBottom: last ? 0 : 24 }}>
      <h2
        className="text-[15px] font-bold"
        style={{ color: 'var(--color-text-primary)', marginBottom: 10 }}
      >
        {title}
      </h2>
      <div
        className="text-[13px] leading-relaxed space-y-2"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {children}
      </div>
      <style>{`
        article ul { padding-left: 20px; margin-top: 8px; }
        article li { list-style: disc; margin-bottom: 4px; }
      `}</style>
    </section>
  )
}
