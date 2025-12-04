import Link from 'next/link'
import { ArrowRight, Dumbbell, Apple, TrendingUp, Target } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FitJourney</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              เริ่มต้นใช้งาน
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Fitness Journey
            <span className="block text-blue-600 mt-2">with AI-Powered Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            บันทึกการออกกำลังกาย ติดตามอาหาร วัดน้ำหนัก และสร้างนิสัยที่ดี
            พร้อม AI ที่ช่วยวิเคราะห์และแนะนำคุณ
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center gap-2"
            >
              เริ่มต้นฟรี
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition font-semibold text-lg border border-gray-200"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Dumbbell className="h-8 w-8 text-blue-600" />}
            title="Workout Tracking"
            description="บันทึกการออกกำลังกาย ทั้ง Cardio, Strength, HIIT และอื่นๆ"
          />
          <FeatureCard
            icon={<Apple className="h-8 w-8 text-green-600" />}
            title="Food & Calories"
            description="ติดตามอาหารและแคลอรี่ พร้อม AI ช่วยประมาณจากรูปภาพ"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
            title="Progress Analytics"
            description="ดูเทรนด์และความคืบหน้าในระยะยาว พร้อมกราฟสวยงาม"
          />
          <FeatureCard
            icon={<Target className="h-8 w-8 text-orange-600" />}
            title="Habit Tracker"
            description="สร้างและติดตามนิสัยที่ดี พร้อมระบบ streak"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            พร้อมเริ่มต้นการเปลี่ยนแปลงแล้วหรือยัง?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            เริ่มต้นฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
          >
            สมัครใช้งานฟรี
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">© 2025 FitJourney. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              เกี่ยวกับ
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              ช่วยเหลือ
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              ความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
