import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  '폼클렌징',
  '토너',
  '로션',
  '에센스',
  '크림',
  '팩',
  '앰플',
  '선크림'
]

const SKIN_TYPES = [
  '건성',
  '지성',
  '중성',
  '복합성',
  '민감성',
  '속건성'
]

const ADMIN_PASSWORD = '1234'

// 이미지 미리보기 컴포넌트
function ImagePreview({ url }) {
  const [imageError, setImageError] = useState(false)

  return (
    <>
      {!imageError ? (
        <img
          src={url}
          alt="제품 미리보기"
          className="max-w-full max-h-[200px] object-contain rounded-lg"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="text-gray-400 text-sm text-center">
          <p>이미지를 불러올 수 없습니다</p>
          <p className="text-xs mt-1">URL을 확인해주세요</p>
        </div>
      )}
    </>
  )
}

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    skin_types: [],
    price_range: '',
    features: '',
    ingredients: '',
    keywords: '',
    volume: '',
    coupang_url: '',
    image_url: ''
  })

  // 세션 상태 확인
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('adminAuthenticated')
    if (sessionAuth === 'true') {
      setIsAuthenticated(true)
      fetchProducts()
    }
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cosmetics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('제품 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuthenticated', 'true')
      setPasswordError('')
      fetchProducts()
    } else {
      setPasswordError('비밀번호가 일치하지 않습니다.')
      setPassword('')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSkinTypeChange = (skinType) => {
    setFormData(prev => ({
      ...prev,
      skin_types: prev.skin_types.includes(skinType)
        ? prev.skin_types.filter(st => st !== skinType)
        : [...prev.skin_types, skinType]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // keywords를 쉼표 기준으로 분리하여 배열로 변환
      const keywordsArray = formData.keywords
        ? formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : []
      
      // skin_types는 이미 배열이지만, 혹시 문자열인 경우를 대비해 처리
      const skinTypesArray = Array.isArray(formData.skin_types) 
        ? formData.skin_types 
        : (formData.skin_types ? [formData.skin_types] : [])
      
      if (editingId) {
        // 수정
        const { error } = await supabase
          .from('cosmetics')
          .update({
            name: formData.name,
            category: formData.category,
            skin_types: skinTypesArray,
            price_range: formData.price_range,
            features: formData.features,
            ingredients: formData.ingredients,
            keywords: keywordsArray,
            volume: formData.volume,
            coupang_url: formData.coupang_url,
            image_url: formData.image_url
          })
          .eq('id', editingId)

        if (error) throw error
        alert('제품이 수정되었습니다.')
      } else {
        // 추가
        const { error } = await supabase
          .from('cosmetics')
          .insert([{
            name: formData.name,
            category: formData.category,
            skin_types: skinTypesArray,
            price_range: formData.price_range,
            features: formData.features,
            ingredients: formData.ingredients,
            keywords: keywordsArray,
            volume: formData.volume,
            coupang_url: formData.coupang_url,
            image_url: formData.image_url
          }])

        if (error) throw error
        alert('제품이 추가되었습니다.')
      }

      // 폼 초기화
      setFormData({
        name: '',
        category: '',
        skin_types: [],
        price_range: '',
        features: '',
        ingredients: '',
        keywords: '',
        volume: '',
        coupang_url: '',
        image_url: ''
      })
      setEditingId(null)
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('제품 저장 중 오류가 발생했습니다: ' + error.message)
    }
  }

  const handleEdit = (product) => {
    // keywords가 배열인 경우 쉼표로 구분된 문자열로 변환
    const keywordsString = Array.isArray(product.keywords)
      ? product.keywords.join(', ')
      : (product.keywords || '')
    
    // skin_types는 이미 배열이므로 그대로 사용
    const skinTypesArray = Array.isArray(product.skin_types)
      ? product.skin_types
      : (product.skin_types ? [product.skin_types] : [])
    
    setFormData({
      name: product.name || '',
      category: product.category || '',
      skin_types: skinTypesArray,
      price_range: product.price_range || '',
      features: product.features || '',
      ingredients: product.ingredients || '',
      keywords: keywordsString,
      volume: product.volume || '',
      coupang_url: product.coupang_url || '',
      image_url: product.image_url || ''
    })
    setEditingId(product.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('cosmetics')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('제품이 삭제되었습니다.')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('제품 삭제 중 오류가 발생했습니다: ' + error.message)
    }
  }

  const handlePreviewLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // 비밀번호 입력 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            관리자 인증
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 관리자 대시보드
  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              화장품 관리 대시보드
            </h1>
            <Link
              to="/"
              className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md border border-gray-200"
            >
              ← 메인으로
            </Link>
          </div>
        </div>

        {/* 제품 등록 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
            {editingId ? '제품 수정' : '새 제품 등록'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 제품명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제품명 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="">선택하세요</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 가격대 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격대
                </label>
                <input
                  type="text"
                  name="price_range"
                  value={formData.price_range}
                  onChange={handleInputChange}
                  placeholder="예: 10,000원 ~ 20,000원"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* 용량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  용량
                </label>
                <input
                  type="text"
                  name="volume"
                  value={formData.volume}
                  onChange={handleInputChange}
                  placeholder="예: 150ml"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* 피부 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                피부 유형 (체크박스)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SKIN_TYPES.map(skinType => (
                  <label key={skinType} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.skin_types.includes(skinType)}
                      onChange={() => handleSkinTypeChange(skinType)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{skinType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 특징 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                특징
              </label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                rows="3"
                placeholder="제품의 특징을 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
              />
            </div>

            {/* 성분 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성분
              </label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                rows="3"
                placeholder="주요 성분을 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
              />
            </div>

            {/* 키워드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키워드
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="쉼표로 구분하여 입력 (예: 수분, 진정, 보습)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            {/* 쿠팡 URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                쿠팡 URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="coupang_url"
                  value={formData.coupang_url}
                  onChange={handleInputChange}
                  placeholder="https://www.coupang.com/..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handlePreviewLink(formData.coupang_url)}
                  disabled={!formData.coupang_url}
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
                >
                  미리보기
                </button>
              </div>
            </div>

            {/* 이미지 URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              
              {/* 이미지 미리보기 */}
              {formData.image_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 미리보기
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[200px]">
                    <ImagePreview url={formData.image_url} />
                  </div>
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                {editingId ? '수정하기' : '등록하기'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({
                      name: '',
                      category: '',
                      skin_types: [],
                      price_range: '',
                      features: '',
      ingredients: '',
      keywords: '',
      volume: '',
      coupang_url: '',
      image_url: ''
    })
                  }}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 제품 리스트 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
            제품 목록
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 제품이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제품명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      피부 유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가격대
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      용량
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      쿠팡 링크
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {product.skin_types && product.skin_types.length > 0
                            ? product.skin_types.join(', ')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.price_range || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.volume || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.coupang_url ? (
                          <button
                            onClick={() => handlePreviewLink(product.coupang_url)}
                            className="text-sm text-orange-600 hover:text-orange-800 font-medium underline"
                          >
                            링크 열기
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 font-medium border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPage
