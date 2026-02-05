import './ResultModal.css'

const SKIN_TYPE_INFO = {
  '건성': {
    description: '건성 피부는 피부 표면의 수분과 유분이 부족한 상태입니다. 세안 후 당김 현상이 자주 나타나며, 각질이 잘 일어나고 잔주름이 쉽게 생깁니다.',
    tips: ['수분 공급에 중점을 둔 제품 선택', '오일이나 크림 타입의 제품 사용', '자외선 차단 필수'],
    recommendedIngredients: ['히알루론산', '세라마이드', '글리세린', '스쿠알란', '시어버터'],
    avoidIngredients: ['알코올', '고농도 AHA', '벤조일 퍼옥사이드', '살리실산']
  },
  '지성': {
    description: '지성 피부는 피지 분비가 과도하여 번들거림이 심하고, 모공이 넓으며 블랙헤드와 화이트헤드가 자주 생깁니다.',
    tips: ['유분 조절에 효과적인 제품 선택', '가벼운 텍스처의 제품 사용', '정기적인 각질 관리'],
    recommendedIngredients: ['살리실산', '티트리', '나이아신아마이드', '레티놀', '클레이'],
    avoidIngredients: ['코코넛 오일', '시어버터', '미네랄 오일', '라놀린']
  },
  '중성': {
    description: '중성 피부는 수분과 유분의 균형이 잘 맞아 안정적인 상태입니다. 특별히 건조하지도 번들거리지도 않습니다.',
    tips: ['균형잡힌 스킨케어 루틴 유지', '계절에 따라 제품 조절', '기본적인 보습 관리'],
    recommendedIngredients: ['히알루론산', '나이아신아마이드', '비타민 C', '펩타이드', '녹차 추출물'],
    avoidIngredients: ['과도한 알코올', '강한 각질 제거제', '고농도 레티놀']
  },
  '복합성': {
    description: '복합성 피부는 T존(이마, 코)은 지성이고 볼은 건성인 혼합된 피부 타입입니다. 계절에 따라 피부 상태가 크게 달라질 수 있습니다.',
    tips: ['부위별 맞춤 관리', 'T존은 유분 조절, 볼은 수분 공급', '계절별 제품 교체'],
    recommendedIngredients: ['히알루론산', '살리실산', '나이아신아마이드', '비타민 C', '녹차 추출물'],
    avoidIngredients: ['코코넛 오일', '과도한 오일', '강한 알코올', '고농도 AHA']
  },
  '민감성': {
    description: '민감성 피부는 외부 자극에 쉽게 반응하여 붉어지거나 가려움을 느끼며, 제품을 바꿀 때 트러블이 쉽게 생깁니다.',
    tips: ['순한 성분의 제품 선택', '알레르기 유발 성분 피하기', '패치 테스트 후 사용'],
    recommendedIngredients: ['판테놀', '병풀 추출물', '알란토인', '세라마이드', '카모마일 추출물'],
    avoidIngredients: ['인공향료', '에탄올', '파라벤', '설페이트', '레티놀']
  },
  '속건성': {
    description: '속건성 피부는 피부 속은 건조하지만 겉은 기름져 보이는 상태입니다. 수분 부족으로 인해 과도한 피지가 분비됩니다.',
    tips: ['수분 공급에 중점', '오일 프리 제품 사용', '하이드레이션 강화'],
    recommendedIngredients: ['히알루론산', '글리세린', '알란토인', '녹차 추출물', '나이아신아마이드'],
    avoidIngredients: ['코코넛 오일', '시어버터', '미네랄 오일', '알코올', '과도한 오일']
  }
}

function ResultModal({ skinType, onClose }) {
  const info = SKIN_TYPE_INFO[skinType] || SKIN_TYPE_INFO['중성']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">당신을 위한 피부 분석 리포트</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="skin-type-badge">
            <span className="skin-type-text">{skinType} 피부</span>
          </div>
          
          {/* 피부 유형 특징 */}
          <div className="feature-section">
            <h3 className="section-title">[{skinType} 피부] 특징</h3>
            <p className="skin-description">{info.description}</p>
          </div>
          
          {/* 성분 정보 */}
          <div className="ingredients-section">
            <div className="ingredient-box recommended">
              <div className="ingredient-header">
                <span className="ingredient-icon">✅</span>
                <h3 className="ingredient-title">내 피부에 좋은 성분</h3>
              </div>
              <div className="ingredient-tags">
                {info.recommendedIngredients.map((ingredient, index) => (
                  <span key={index} className="ingredient-tag recommended-tag">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            <div className="ingredient-box avoid">
              <div className="ingredient-header">
                <span className="ingredient-icon">❌</span>
                <h3 className="ingredient-title">주의해야 할 성분</h3>
              </div>
              <div className="ingredient-tags">
                {info.avoidIngredients.map((ingredient, index) => (
                  <span key={index} className="ingredient-tag avoid-tag">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* 관리 팁 */}
          <div className="tips-section">
            <h3 className="tips-title">💡 관리 팁</h3>
            <ul className="tips-list">
              {info.tips.map((tip, index) => (
                <li key={index} className="tip-item">{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="confirm-button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultModal
