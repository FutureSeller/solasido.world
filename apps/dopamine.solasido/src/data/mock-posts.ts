// Mock data matching the blog_posts schema from studio.solasido.world
// This will be replaced with actual D1 queries in production

interface MockBlogPost {
  id: number
  instagramId: string
  slug: string
  title: string
  metaDescription: string
  body: string
  summary: string
  status: 'draft' | 'review' | 'published'
  createdAt: string
  publishedAt: string
  canonicalUrl: string
  ogImageUrl: string | null
}

interface MockAsset {
  id: number
  instagramMediaId: string
  slideIndex: number
  sha256Hash: string
  r2Key: string
  r2Url: string
  width: number
  height: number
  sizeBytes: number
}

// Generate additional mock posts for pagination testing
const generateMockPost = (id: number): MockBlogPost => ({
  id,
  instagramId: `mock_${id}`,
  slug: `post-${id}`,
  title: `테스트 포스트 #${id} 📝`,
  metaDescription: `${id}번째 테스트 포스트입니다. 페이지네이션 테스트를 위한 샘플 컨텐츠.`,
  body: `<h1>테스트 포스트 #${id}</h1><p>이것은 페이지네이션 테스트를 위한 ${id}번째 포스트입니다.</p>`,
  summary: `${id}번째 테스트 포스트`,
  status: 'published',
  createdAt: new Date(Date.now() - id * 86400000).toISOString(),
  publishedAt: new Date(Date.now() - id * 86400000).toISOString(),
  canonicalUrl: `https://instagram.com/p/example${id}`,
  ogImageUrl: null,
})

export const mockPosts: MockBlogPost[] = [
  {
    id: 1,
    instagramId: 'mock_12345',
    slug: 'bubu-ilsang-first-week',
    title: '신혼 첫 주 부부일상툰 🏠',
    metaDescription: '결혼 후 첫 주를 맞이한 신혼부부의 좌충우돌 일상! 설렘과 혼란이 공존하는 신혼생활 이야기를 웃음과 함께 풀어봅니다.',
    body: `<h1>신혼 첫 주를 보내며</h1>

<p>결혼 후 첫 주가 지나갔습니다. 설렘 반, 혼란 반으로 시작한 신혼생활!</p>

<h2>달라진 일상들</h2>

<p>아침에 눈을 뜨면 옆에 누군가 있다는 게 아직도 신기해요. 서로의 생활 패턴을 맞춰가는 과정이 때로는 어렵지만, 함께라서 행복합니다.</p>

<h3>첫 번째 도전: 아침 기상</h3>

<ul>
<li>저는 아침형 인간</li>
<li>남편은 완전 올빼미형</li>
<li>서로의 패턴을 존중하기로 했어요</li>
</ul>

<h3>두 번째 도전: 집안일 분담</h3>

<p>설거지, 청소, 빨래... 누가 뭘 할지 정하는 것도 하나의 과정이더라고요. 하지만 함께 하니까 재밌어요!</p>

<h2>소소한 행복들</h2>

<p>매일 저녁 함께 드라마 보는 시간이 가장 좋아요. 간단한 간식 준비하고, 소파에 앉아서 함께 웃고 떠들고.</p>

<blockquote>"이런 소소한 순간들이 모여 우리만의 일상이 되는 거겠죠?"</blockquote>

<p>앞으로도 많은 순간들을 함께 만들어가고 싶습니다! 💕</p>`,
    summary: '신혼 첫 주의 좌충우돌 일상 이야기',
    status: 'published',
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    canonicalUrl: 'https://instagram.com/p/example1',
    ogImageUrl: null,
  },
  {
    id: 2,
    instagramId: 'mock_67890',
    slug: 'cooking-together',
    title: '함께하는 첫 요리 도전기 👨‍🍳👩‍🍳',
    metaDescription: '신혼부부가 처음으로 함께 도전한 요리! 과연 맛있는 저녁을 만들 수 있을까? 웃음 가득한 요리 도전 이야기.',
    body: `<h1>우리의 첫 요리 도전</h1>

<p>결혼 전에는 각자 간단한 요리만 했던 우리. 오늘은 처음으로 본격적인 요리에 도전했습니다!</p>

<h2>메뉴 선정</h2>

<p>고민 끝에 선택한 메뉴는... <strong>김치찌개와 계란말이!</strong></p>

<p>간단하면서도 실패할 확률이 낮은(?) 메뉴를 골랐어요.</p>

<h3>준비 과정</h3>

<ol>
<li>마트에서 재료 구매 (이것부터 설렘!)</li>
<li>레시피 검색 (유튜브 3개 영상 참고)</li>
<li>역할 분담 결정</li>
</ol>

<h2>요리 시작!</h2>

<p>저는 김치찌개, 남편은 계란말이를 맡기로 했어요.</p>

<p><strong>예상치 못한 해프닝들:</strong></p>
<ul>
<li>김치찌개 간이 너무 셌다가 싱거웠다가 반복</li>
<li>계란말이가 계란 스크램블이 될 뻔한 위기</li>
<li>주방이 전쟁터가 됨 😅</li>
</ul>

<p>하지만 결과는? <strong>대성공!</strong></p>

<h2>함께 만든 첫 식사</h2>

<p>맛은 완벽하진 않았지만, 함께 만들어서 그런지 세상에서 가장 맛있었어요.</p>

<p>다음엔 뭘 만들어볼까 벌써 고민 중입니다! 🍳</p>`,
    summary: '신혼부부의 좌충우돌 요리 도전기',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    canonicalUrl: 'https://instagram.com/p/example2',
    ogImageUrl: null,
  },
  {
    id: 3,
    instagramId: 'mock_11111',
    slug: 'weekend-morning',
    title: '주말 아침의 행복 ☕️',
    metaDescription: '늦잠과 브런치로 시작하는 신혼부부의 주말 아침. 소소하지만 특별한 우리의 주말 루틴을 소개합니다.',
    body: `<h1>주말 아침의 여유</h1>

<p>평일엔 바쁘게 출근 준비하느라 정신없지만, 주말 아침만큼은 여유롭게!</p>

<h2>우리만의 주말 루틴</h2>

<h3>1. 알람 없는 아침</h3>
<p>주말엔 알람을 맞추지 않아요. 자연스럽게 눈이 떠지는 시간까지 푹 자는 게 최고의 사치죠.</p>

<h3>2. 느긋한 브런치</h3>
<ul>
<li>남편이 커피를 내려주고</li>
<li>저는 간단한 샌드위치를 만들어요</li>
<li>창가 테이블에 앉아서 함께 먹는 시간</li>
</ul>

<h3>3. 계획 없는 오후</h3>
<p>특별한 약속이 없다면 그냥 집에서 뒹굴거려요. 영화 보거나, 책 읽거나, 그냥 수다 떨거나.</p>

<h2>작은 행복</h2>

<p>이렇게 아무것도 하지 않는 시간이 주는 평화로움.</p>

<p>주말이 주는 선물은 시간적 여유뿐만 아니라, 서로에게 집중할 수 있는 마음의 여유인 것 같아요.</p>

<p>다음 주말엔 뭘 할까요? 벌써 기대됩니다! 💕</p>`,
    summary: '느긋한 주말 아침을 즐기는 부부의 일상',
    status: 'published',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    canonicalUrl: 'https://instagram.com/p/example3',
    ogImageUrl: null,
  },
  // Add more posts for pagination testing (total 15 posts to test pagination)
  ...Array.from({ length: 12 }, (_, i) => generateMockPost(i + 4)),
]

export const mockAssets: MockAsset[] = [
  {
    id: 1,
    instagramMediaId: 'mock_12345',
    slideIndex: 0,
    sha256Hash: 'mock_hash_1',
    r2Key: 'instagram/aa/aabbcc.webp',
    r2Url: 'https://picsum.photos/seed/couple1/800/600',
    width: 800,
    height: 600,
    sizeBytes: 150000,
  },
  {
    id: 2,
    instagramMediaId: 'mock_12345',
    slideIndex: 1,
    sha256Hash: 'mock_hash_2',
    r2Key: 'instagram/bb/bbccdd.webp',
    r2Url: 'https://picsum.photos/seed/couple2/800/600',
    width: 800,
    height: 600,
    sizeBytes: 145000,
  },
  {
    id: 3,
    instagramMediaId: 'mock_67890',
    slideIndex: 0,
    sha256Hash: 'mock_hash_3',
    r2Key: 'instagram/cc/ccddee.webp',
    r2Url: 'https://picsum.photos/seed/cooking/800/600',
    width: 800,
    height: 600,
    sizeBytes: 160000,
  },
  {
    id: 4,
    instagramMediaId: 'mock_11111',
    slideIndex: 0,
    sha256Hash: 'mock_hash_4',
    r2Key: 'instagram/dd/ddeeff.webp',
    r2Url: 'https://picsum.photos/seed/morning/800/600',
    width: 800,
    height: 600,
    sizeBytes: 155000,
  },
]

// Helper function to get assets for a post
export function getAssetsForPost(instagramId: string): MockAsset[] {
  return mockAssets.filter((asset) => asset.instagramMediaId === instagramId)
}

// Helper function to get published posts
export function getPublishedPosts(): MockBlogPost[] {
  return mockPosts.filter((post) => post.status === 'published')
}

// Helper function to get post by slug
export function getPostBySlug(slug: string): MockBlogPost | undefined {
  return mockPosts.find((post) => post.slug === slug)
}
