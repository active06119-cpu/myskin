import { useState } from 'react'
import './SkinTypeSurvey.css'

const SURVEY_QUESTIONS = [
  '세안 후 피부가 당기거나 건조함을 자주 느낀다.',
  '하루 중 피부가 번들거리며 유분이 많이 나온다.',
  'T존(이마·코)은 번들거리지만 볼은 건조하다.',
  '피부가 외부 자극(화장품, 날씨)에 쉽게 붉어지거나 가렵다.',
  '피부 속은 건조한데 겉은 기름져 보인다.',
  '계절이 바뀔 때 피부 상태가 크게 달라진다.',
  '모공이 넓고 블랙헤드·화이트헤드가 자주 생긴다.',
  '피부가 특별히 건조하지도, 번들거리지도 않고 안정적이다.',
  '피부에 각질이 잘 일어나고 잔주름이 쉽게 생긴다.',
  '피부 관리 제품을 바꿀 때 트러블이 쉽게 생긴다.'
]

const LIKERT_SCALE = [
  { value: 1, label: '전혀 그렇지 않다' },
  { value: 2, label: '그렇지 않다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '완전 그렇다' }
]

function SkinTypeSurvey({ onComplete }) {
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    })
  }

  const handleNext = () => {
    if (answers[currentQuestion] !== undefined) {
      if (currentQuestion < SURVEY_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // 설문 완료 - 결과 계산
        const skinType = calculateSkinType(answers)
        onComplete(skinType)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateSkinType = (answers) => {
    // 각 피부 유형별 점수 계산
    const scores = {
      '건성': (answers[0] || 0) + (answers[8] || 0), // 1번, 9번
      '지성': (answers[1] || 0) + (answers[6] || 0), // 2번, 7번
      '중성': answers[7] || 0, // 8번
      '복합성': (answers[2] || 0) + (answers[5] || 0), // 3번, 6번
      '민감성': (answers[3] || 0) + (answers[9] || 0), // 4번, 10번
      '속건성': answers[4] || 0 // 5번
    }

    // 중성 피부는 8번 문항이 높을 때만 (3점 이상)
    if (scores['중성'] >= 3) {
      return '중성'
    }

    // 가장 높은 점수의 피부 유형 반환
    const maxScore = Math.max(...Object.values(scores))
    const skinType = Object.keys(scores).find(key => scores[key] === maxScore)
    
    return skinType || '중성'
  }

  const progress = ((currentQuestion + 1) / SURVEY_QUESTIONS.length) * 100

  return (
    <div className="survey-container">
      <div className="survey-card">
        <h1 className="survey-title">피부 유형 진단 설문</h1>
        <p className="survey-subtitle">당신의 피부 유형을 알아보세요</p>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">{currentQuestion + 1} / {SURVEY_QUESTIONS.length}</p>

        <div className="question-section">
          <h2 className="question-text">
            {SURVEY_QUESTIONS[currentQuestion]}
          </h2>

          <div className="likert-scale">
            {LIKERT_SCALE.map((item) => (
              <button
                key={item.value}
                className={`likert-button ${answers[currentQuestion] === item.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(item.value)}
              >
                <span className="likert-value">{item.value}</span>
                <span className="likert-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="survey-buttons">
          <button
            className="nav-button prev-button"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            이전
          </button>
          <button
            className="nav-button next-button"
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
          >
            {currentQuestion === SURVEY_QUESTIONS.length - 1 ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SkinTypeSurvey
