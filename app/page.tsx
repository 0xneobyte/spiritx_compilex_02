"use client";

import React from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import {
  ArrowRight,
  Trophy,
  Users,
  BarChart3,
  Bot,
  Shield,
  ChevronRight,
  Zap,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Spirit11
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-gray-700 hover:text-purple-600 transition"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-700 hover:text-purple-600 transition"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-700 hover:text-purple-600 transition"
            >
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-purple-600 hover:bg-purple-700 font-medium rounded-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-purple-50 to-white overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-block px-4 py-1.5 bg-purple-100 rounded-full text-purple-700 font-medium text-sm mb-2">
                #1 Fantasy Cricket Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                The Ultimate{" "}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Inter-University
                </span>{" "}
                Fantasy Cricket Game
              </h1>
              <p className="text-lg text-gray-600">
                Build your dream team from real university players, analyze
                statistics, and compete with others for the top spot on the
                leaderboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 rounded-full h-14 px-8"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-14 px-8 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20" />
                <Image
                  src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1747&q=80"
                  alt="Cricket players in action"
                  fill
                  priority
                  className="object-cover"
                  onError={(e) => {
                    // Fallback in case image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite error loop
                    target.src = "/placeholder.svg?height=450&width=600"; // Fallback image
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                  <p className="text-white font-medium text-xl">
                    Build your ultimate team and dominate the leaderboard!
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-8 -right-8 bg-white p-5 rounded-2xl shadow-xl backdrop-blur-sm bg-white/90"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Trophy className="h-7 w-7 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-xl">9,000,000</p>
                    <p className="text-sm text-gray-500">
                      Starting Budget (Rs.)
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-indigo-300 rounded-full filter blur-3xl opacity-20"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                number: "10K+",
                label: "Active Players",
                icon: <Users className="h-6 w-6 text-purple-400" />,
              },
              {
                number: "15+",
                label: "Universities",
                icon: <Award className="h-6 w-6 text-purple-400" />,
              },
              {
                number: "100+",
                label: "Cricket Stars",
                icon: <Zap className="h-6 w-6 text-purple-400" />,
              },
              {
                number: "Rs 50M+",
                label: "Prize Pool",
                icon: <Trophy className="h-6 w-6 text-purple-400" />,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="text-center p-6 rounded-2xl border border-purple-100 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-50 p-3 rounded-full">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 md:py-28 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 bg-purple-100 rounded-full text-purple-700 font-medium text-sm mb-4"
            >
              Game Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent"
            >
              Experience Fantasy Cricket Like Never Before
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Spirit11 brings you the most immersive fantasy cricket experience
              with these amazing features
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-10 w-10 text-purple-600" />,
                title: "Build Your Dream Team",
                description:
                  "Select real university players and create your ultimate cricket team within your budget.",
              },
              {
                icon: <BarChart3 className="h-10 w-10 text-purple-600" />,
                title: "Real-time Statistics",
                description:
                  "Track player performance and team statistics as the tournament progresses.",
              },
              {
                icon: <Trophy className="h-10 w-10 text-purple-600" />,
                title: "Compete on Leaderboards",
                description:
                  "Climb the ranks and compete with other fantasy team owners for the top spot.",
              },
              {
                icon: <Bot className="h-10 w-10 text-purple-600" />,
                title: "AI-powered Assistant",
                description:
                  "Get intelligent recommendations and insights to help you build the best team.",
              },
              {
                icon: <Shield className="h-10 w-10 text-purple-600" />,
                title: "University Pride",
                description:
                  "Support your university while enjoying the competitive spirit of fantasy cricket.",
              },
              {
                icon: <Zap className="h-10 w-10 text-purple-600" />,
                title: "Strategic Team Management",
                description:
                  "Make transfers and adjustments to optimize your team throughout the tournament.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 group"
              >
                <div className="bg-purple-50 p-4 rounded-2xl w-fit mb-6 group-hover:bg-purple-100 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-6 flex items-center text-purple-600 font-medium">
                  <span>Learn more</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-purple-100 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-indigo-100 rounded-full filter blur-3xl opacity-50"></div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 bg-purple-100 rounded-full text-purple-700 font-medium text-sm mb-4"
            >
              Simple Process
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent"
            >
              How Spirit11 Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Get started with Spirit11 in just a few simple steps
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create an Account",
                description:
                  "Sign up and get your initial budget of Rs.9,000,000 to build your team.",
                icon: <Users className="h-8 w-8 text-purple-600" />,
              },
              {
                step: "02",
                title: "Draft Your Players",
                description:
                  "Select players from different universities within your budget constraints.",
                icon: <Shield className="h-8 w-8 text-purple-600" />,
              },
              {
                step: "03",
                title: "Compete & Win",
                description:
                  "Earn points based on your players' real-life performances and climb the leaderboard.",
                icon: <Trophy className="h-8 w-8 text-purple-600" />,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                className="relative"
              >
                <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-purple-100 group hover:border-purple-200">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-purple-50 rounded-2xl">
                      {step.icon}
                    </div>
                    <div className="text-7xl font-bold bg-gradient-to-r from-purple-600/30 to-indigo-600/30 bg-clip-text text-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <ArrowRight className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-20 md:py-28 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 bg-purple-100 rounded-full text-purple-700 font-medium text-sm mb-4"
            >
              Testimonials
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent"
            >
              What Our Users Say
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Spirit11 has completely changed how I experience university cricket. The AI chatbot gave me amazing team suggestions!",
                name: "Rahul Sharma",
                title: "Delhi University",
                avatar: "https://randomuser.me/api/portraits/men/1.jpg",
              },
              {
                quote:
                  "The real-time statistics and leaderboard make the game so competitive and fun. I'm addicted to checking my rankings!",
                name: "Priya Patel",
                title: "Mumbai University",
                avatar: "https://randomuser.me/api/portraits/women/2.jpg",
              },
              {
                quote:
                  "Building my dream team within budget was challenging but incredibly rewarding when my players performed well.",
                name: "Arun Kumar",
                title: "Bangalore University",
                avatar: "https://randomuser.me/api/portraits/men/3.jpg",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6">{testimonial.quote}</p>
                <div className="flex items-center">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full mr-4 border-2 border-purple-200 object-cover"
                    onError={(e) => {
                      // Fallback in case avatar fails to load
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite error loop
                      target.src =
                        "/placeholder.svg?height=48&width=48&text=User"; // Fallback image
                    }}
                  />
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1747&q=80')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Build Your Dream Team?
              </h2>
              <p className="text-xl mb-8 text-purple-100">
                Join thousands of cricket fans and experience the thrill of
                fantasy cricket with Spirit11.
              </p>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 rounded-full h-14 px-8"
                >
                  Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-7 w-7 text-purple-400" />
                <span className="text-2xl font-bold">Spirit11</span>
              </div>
              <p className="text-gray-400 mb-6">
                The Ultimate Inter-University Fantasy Cricket Game
              </p>
              <div className="flex space-x-4">
                {["facebook", "twitter", "instagram", "linkedin"].map(
                  (social, index) => (
                    <a
                      key={index}
                      href="#"
                      className="bg-gray-800 p-2 rounded-full hover:bg-purple-600 transition-colors duration-300"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="w-5 h-5"></div>
                    </a>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6">Legal</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-400">
                  <span className="mr-2">📧</span> support@spirit11.com
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2">📱</span> +94 123 456 789
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2">🏢</span> Colombo, Sri Lanka
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Spirit11. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
