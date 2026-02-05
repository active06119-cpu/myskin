import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import './ProductComparison.css'

const PRODUCT_CATEGORIES = [
  { id: '폼클렌징', name: '폼클렌징', icon: '🧼' },
  { id: '토너', name: '토너', icon: '💧' },
  { id: '로션', name: '로션', icon: '🧴' },
  { id: '에센스', name: '에센스', icon: '✨' },
  { id: '크림', name: '크림', icon: '🧴' },
  { id: '팩', name: '팩', icon: '🎭' },
  { id: '앰플', name: '앰플', icon: '💉' },
  { id: '선크림', name: '선크림', icon: '☀️' }
]

function ProductComparison({ skinType, onShowModal, onResetSurvey }) {
  const [selectedCategory, setSelectedCategory] = useState(PRODUCT_CATEGORIES[0].id)

  return (
    <div className="product-comparison">
      <header className="comparison-header">
        <h1 className="main-title">화장품 비교</h1>
      </header>

      {/* 피부 유형 요약 카드 */}
      <div className="skin-type-summary-card">
        <div className="summary-content">
          <div className="summary-icon">✨</div>
          <div className="summary-text">
            <h2 className="summary-title">당신은 {skinType} 피부입니다</h2>
            <p className="summary-subtitle">맞춤형 제품 추천을 확인해보세요</p>
          </div>
        </div>
        <button 
          className="summary-button"
          onClick={onShowModal}
        >
          유형 설명 보기
        </button>
      </div>

      {/* 카테고리 탭 메뉴 */}
      <div className="category-tabs-container">
        <div className="category-tabs">
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-tab-icon">{category.icon}</span>
              <span className="category-tab-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 쿠팡 파트너스 안내 칸 (카테고리 바와 유사한 디자인) */}
      <div className="my-6 flex justify-center">
        <div className="w-full bg-white border border-gray-100 rounded-full shadow-md px-8 py-4">
          <p className="text-center text-lg md:text-xl text-black font-bold leading-relaxed">
            이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
        </div>
      </div>

      {/* 선택된 카테고리의 제품 리스트 */}
      <div className="products-section-wrapper">
        <ProductList 
          category={selectedCategory}
          skinType={skinType}
          key={selectedCategory} // 카테고리 변경 시 리렌더링을 위한 key
        />
      </div>

      {/* 내 피부 다시 진단하기 버튼 */}
      <div className="reset-survey-section">
        <button 
          className="reset-survey-button"
          onClick={onResetSurvey}
        >
          내 피부 다시 진단하기
        </button>
      </div>
    </div>
  )
}

function ProductList({ category, skinType }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    fetchProducts()
    // 카테고리 변경 시 스크롤 위치 초기화
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0
    }
  }, [category, skinType])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cosmetics')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      const filteredProducts = (data || []).filter(product => {
        if (!product.skin_types || !Array.isArray(product.skin_types)) {
          return false
        }
        return product.skin_types.includes(skinType)
      })
      
      setProducts(filteredProducts.slice(0, 5)) // 최대 5개만 표시
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleWheel = (e) => {
    const container = scrollContainerRef.current
    if (!container) return

    // 수평 스크롤만 허용
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault()
      container.scrollLeft += e.deltaX
    }
  }

  if (loading) {
    return (
      <div className="products-section">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>제품 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="products-section">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3 className="empty-title">제품 정보 준비 중</h3>
          <p className="empty-description">
            {skinType} 피부에 맞는 {category} 제품 정보를 곧 추가할 예정입니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="products-section">
      <div
        className="products-scroll-container"
        ref={scrollContainerRef}
        onWheel={handleWheel}
      >
        <div className="products-scroll-content">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  // keywords를 배열로 변환 (배열이 아니면 빈 배열)
  const keywordsArray = Array.isArray(product.keywords) 
    ? product.keywords 
    : (product.keywords ? [product.keywords] : [])

  return (
    <div className="product-card-slide">
      {/* 제품 이미지 */}
      <div className="product-image-container">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="product-image-placeholder" style={{ display: product.image_url ? 'none' : 'flex' }}>
          <div className="placeholder-content">
            <span className="placeholder-icon">📦</span>
            <span className="placeholder-text">이미지 준비 중</span>
          </div>
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-details">
          <div className="detail-row">
            <span className="detail-label">가격:</span>
            <span className="detail-value">{product.price_range || '-'}</span>
          </div>
          
          {product.volume && (
            <div className="detail-row">
              <span className="detail-label">용량:</span>
              <span className="detail-value">{product.volume}</span>
            </div>
          )}
          
          {product.features && (
            <div className="detail-row full-width">
              <span className="detail-label">제품 특징:</span>
              <span className="detail-value">{product.features}</span>
            </div>
          )}
          
          {product.ingredients && (
            <div className="detail-row full-width">
              <span className="detail-label">성분:</span>
              <span className="detail-value">{product.ingredients}</span>
            </div>
          )}
          
          {keywordsArray.length > 0 && (
            <div className="detail-row full-width">
              <span className="detail-label">키워드:</span>
              <div className="keywords-tags">
                {keywordsArray.map((keyword, idx) => (
                  <span key={idx} className="keyword-tag">
                    #{keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* 최저가 확인 및 구매하기 버튼 - 항상 표시 */}
        <div className="product-card-footer">
          {product.coupang_url ? (
            <a
              href={product.coupang_url}
              target="_blank"
              rel="noopener noreferrer"
              className="coupang-button"
            >
              <span className="coupang-icon">🚀</span>
              최저가 확인 및 구매하기
            </a>
          ) : (
            <div className="coupang-button disabled">
              <span className="coupang-icon">🚀</span>
              링크 준비 중
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductComparison
