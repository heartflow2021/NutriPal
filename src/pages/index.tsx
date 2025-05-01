import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import { healthNeedOptions } from '@/types';

export default function Home() {
  return (
    <Layout>
      {/* 英雄區塊 */}
      <section className="bg-gradient-to-b from-background to-white py-16 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-4">
              找到最適合你的<span className="text-primary-600">保健品組合</span>
              <br />不再盲目購買
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              根據您的健康需求、生活習慣和預算，我們的個人化推薦系統提供最適合的 iHerb 保健品組合，
              讓您精準投資健康，省時又省錢。
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button href="/survey" variant="primary" size="lg">
                開始健康諮詢
              </Button>
              <Button href="/about" variant="outline" size="lg">
                了解更多
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <div className="w-full h-96 bg-gray-200">
                {/* 放置實際的圖片 */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <span>健康諮詢示意圖</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 價值主張區塊 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">我們解決了保健品選擇的難題</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              不再花費無數時間研究各種產品，我們的系統幫您找出最適合的保健品組合。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 價值主張 1 */}
            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <div className="bg-primary-100 inline-block p-3 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">個人化推薦</h3>
              <p className="text-gray-600">
                根據您的健康需求、生活習慣和預算，提供最適合您的保健品組合。
              </p>
            </div>

            {/* 價值主張 2 */}
            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <div className="bg-secondary-100 inline-block p-3 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">專業指導</h3>
              <p className="text-gray-600">
                將複雜的營養知識轉化為簡單易懂的個人建議，讓您輕鬆了解如何使用。
              </p>
            </div>

            {/* 價值主張 3 */}
            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <div className="bg-accent-100 inline-block p-3 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-accent-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">省時省力</h3>
              <p className="text-gray-600">
                不再花費數小時比較產品，我們幫您搞定最佳選擇，節省時間與精力。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 使用步驟區塊 */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">簡單三步驟，找到最適合的保健品</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              我們的推薦過程簡單又高效，只需幾分鐘即可獲得個人化的建議。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 步驟 1 */}
            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-md h-full">
                <div className="absolute -top-4 -left-4 bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3 mt-4">填寫簡短問卷</h3>
                <p className="text-gray-600">
                  回答關於您健康需求、生活習慣和預算的簡短問題，只需 2 分鐘。
                </p>
              </div>
            </div>

            {/* 步驟 2 */}
            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-md h-full">
                <div className="absolute -top-4 -left-4 bg-secondary-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3 mt-4">獲得個人化推薦</h3>
                <p className="text-gray-600">
                  我們的系統根據您的回答，從數百種產品中篩選出最適合您的保健品組合。
                </p>
              </div>
            </div>

            {/* 步驟 3 */}
            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-md h-full">
                <div className="absolute -top-4 -left-4 bg-accent-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3 mt-4">查看詳細建議</h3>
                <p className="text-gray-600">
                  獲得每日服用指南、產品詳情和使用建議，輕鬆購買並開始您的健康之旅。
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button href="/survey" variant="primary" size="lg">
              立即開始健康諮詢
            </Button>
          </div>
        </div>
      </section>

      {/* 常見健康需求區塊 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">常見健康需求</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              選擇您最關心的健康議題，獲取專門的保健品推薦。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthNeedOptions.slice(0, 8).map((option) => (
              <Link
                key={option.id}
                href={`/survey?healthNeed=${option.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{option.label}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    獲取針對{option.label}的保健品推薦
                  </p>
                  <span className="text-primary-600 text-sm font-medium flex items-center">
                    立即了解
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 用戶見證區塊 - 未來可添加 */}

      {/* 行動召喚區塊 */}
      <section className="py-12 md:py-20 bg-primary-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">開始您的個人化健康之旅</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            立即獲取專為您設計的保健品推薦方案，不再盲目選購，精準提升健康。
          </p>
          <Button
            href="/survey"
            variant="accent"
            size="lg"
            className="px-10 py-4 text-lg font-semibold"
          >
            免費獲取保健品推薦
          </Button>
        </div>
      </section>
    </Layout>
  );
} 