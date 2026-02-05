import { useState, useEffect } from 'react'
import SkinTypeSurvey from '../components/SkinTypeSurvey'
import ResultModal from '../components/ResultModal'
import ProductComparison from '../components/ProductComparison'

function HomePage() {
  const [skinType, setSkinType] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false)

  useEffect(() => {
    // 로컬 스토리지에서 설문 완료 여부 확인
    const savedSkinType = localStorage.getItem('skinType')
    const savedCompleted = localStorage.getItem('hasCompletedSurvey')
    
    if (savedSkinType && savedCompleted === 'true') {
      setSkinType(savedSkinType)
      setHasCompletedSurvey(true)
    }
  }, [])

  const handleSurveyComplete = (result) => {
    setSkinType(result)
    setShowResultModal(true)
    setHasCompletedSurvey(true)
    localStorage.setItem('skinType', result)
    localStorage.setItem('hasCompletedSurvey', 'true')
  }

  const handleCloseModal = () => {
    setShowResultModal(false)
  }

  const handleShowModal = () => {
    setShowResultModal(true)
  }

  const handleResetSurvey = () => {
    // 모든 설문 데이터 초기화
    localStorage.removeItem('skinType')
    localStorage.removeItem('hasCompletedSurvey')
    setSkinType(null)
    setHasCompletedSurvey(false)
    setShowResultModal(false)
  }

  return (
    <div className="App">
      {!hasCompletedSurvey ? (
        <SkinTypeSurvey onComplete={handleSurveyComplete} />
      ) : (
        <>
          <ProductComparison 
            skinType={skinType} 
            onShowModal={handleShowModal}
            onResetSurvey={handleResetSurvey}
          />
          {showResultModal && (
            <ResultModal 
              skinType={skinType} 
              onClose={handleCloseModal}
            />
          )}
        </>
      )}
    </div>
  )
}

export default HomePage
