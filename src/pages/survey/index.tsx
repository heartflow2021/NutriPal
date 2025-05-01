import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import { 
  healthNeedOptions, 
  lifestyleOptions, 
  budgetOptions, 
  frequencyOptions,
  SurveyQueryParams
} from '@/types';

const SurveyPage = () => {
  const router = useRouter();
  const { healthNeed: initialHealthNeed } = router.query as SurveyQueryParams;

  // 步驟狀態
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // 表單狀態
  const [selectedHealthNeeds, setSelectedHealthNeeds] = useState<string[]>([]);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');

  // 如果URL中有初始健康需求，設置它
  useEffect(() => {
    if (initialHealthNeed && healthNeedOptions.some(option => option.id === initialHealthNeed)) {
      setSelectedHealthNeeds([initialHealthNeed]);
    }
  }, [initialHealthNeed]);

  // 進度百分比
  const progressPercentage = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    // 表單驗證
    if (currentStep === 1 && selectedHealthNeeds.length === 0) {
      alert('請至少選擇一項健康需求');
      return;
    }
    if (currentStep === 2 && !selectedLifestyle) {
      alert('請選擇您的生活型態');
      return;
    }
    if (currentStep === 3 && !selectedBudget) {
      alert('請選擇您的預算範圍');
      return;
    }
    if (currentStep === 4 && !selectedFrequency) {
      alert('請選擇您的服用頻率偏好');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // 提交表單
      submitSurvey();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const submitSurvey = () => {
    // 在實際應用中，這裡會將數據發送到服務器
    console.log({
      healthNeeds: selectedHealthNeeds,
      lifestyle: selectedLifestyle,
      budget: selectedBudget,
      frequency: selectedFrequency,
      allergies,
    });

    // 暫時方案：直接導向結果頁面，並通過URL參數傳遞選擇
    router.push({
      pathname: '/survey/results',
      query: {
        healthNeeds: selectedHealthNeeds.join(','),
        lifestyle: selectedLifestyle,
        budget: selectedBudget,
        frequency: selectedFrequency,
      },
    });
  };

  const toggleHealthNeed = (id: string) => {
    if (selectedHealthNeeds.includes(id)) {
      setSelectedHealthNeeds(selectedHealthNeeds.filter(item => item !== id));
    } else {
      setSelectedHealthNeeds([...selectedHealthNeeds, id]);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">健康需求諮詢</h1>
          <p className="text-gray-600 mb-8 text-center">
            回答以下幾個簡單問題，我們將為您推薦最適合的保健品組合。
          </p>

          {/* 進度條 */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                步驟 {currentStep} / {totalSteps}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* 問卷內容 */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            {/* 步驟 1: 健康需求 */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">您目前最想改善的健康狀況是什麼？</h2>
                <p className="text-gray-600 mb-6">請選擇一項或多項您最關心的健康需求。</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {healthNeedOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => toggleHealthNeed(option.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedHealthNeeds.includes(option.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-5 h-5 rounded-full border mr-3 mt-0.5 flex items-center justify-center ${
                            selectedHealthNeeds.includes(option.id)
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedHealthNeeds.includes(option.id) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{option.label}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 步驟 2: 生活習慣 */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">您的日常生活型態是？</h2>
                <p className="text-gray-600 mb-6">
                  請選擇最符合您日常狀況的選項，這將幫助我們推薦更適合的保健品。
                </p>

                <div className="space-y-4 mb-6">
                  {lifestyleOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedLifestyle(option.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedLifestyle === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-5 h-5 rounded-full border mr-3 mt-0.5 flex items-center justify-center ${
                            selectedLifestyle === option.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedLifestyle === option.id && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{option.label}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 步驟 3: 預算範圍 */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">您的保健品預算範圍是？</h2>
                <p className="text-gray-600 mb-6">
                  請選擇您每月願意投入在保健品上的預算範圍。
                </p>

                <div className="space-y-4 mb-6">
                  {budgetOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedBudget(option.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedBudget === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-5 h-5 rounded-full border mr-3 mt-0.5 flex items-center justify-center ${
                            selectedBudget === option.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedBudget === option.id && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{option.label}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 步驟 4: 服用頻率偏好 */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">您偏好的服用方式是？</h2>
                <p className="text-gray-600 mb-6">
                  請選擇您最能接受的保健品服用頻率和方式。
                </p>

                <div className="space-y-4 mb-6">
                  {frequencyOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedFrequency(option.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedFrequency === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-5 h-5 rounded-full border mr-3 mt-0.5 flex items-center justify-center ${
                            selectedFrequency === option.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedFrequency === option.id && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{option.label}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 步驟 5: 過敏史與備註 */}
            {currentStep === 5 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">您有任何藥物過敏或需要特別注意的事項嗎？</h2>
                <p className="text-gray-600 mb-6">
                  請填寫任何您知道的過敏史或其他需要我們注意的健康狀況，這有助於我們避免推薦不適合您的產品。（選填）
                </p>

                <div className="mb-6">
                  <textarea
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="input h-32 w-full"
                    placeholder="例如：對某些成分過敏、正在服用的藥物、特殊健康狀況等..."
                  ></textarea>
                </div>
              </div>
            )}

            {/* 導航按鈕 */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  返回上一步
                </Button>
              ) : (
                <div></div>
              )}
              <Button onClick={nextStep}>
                {currentStep < totalSteps ? '下一步' : '完成並查看結果'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SurveyPage; 