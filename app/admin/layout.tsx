export const metadata = {
  title: "EMFRONTIER LAB - 관리자",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 
        JS 로드 전 body 배경을 즉시 #0F172A로 세팅
        → 흰색 깜빡임(FOUC) 방지
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.body.style.backgroundColor="#0F172A";document.documentElement.style.backgroundColor="#0F172A";`,
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `html,body{background-color:#0F172A!important;}` }} />
      {children}
    </>
  );
}
