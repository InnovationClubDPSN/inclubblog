import { Suspense, lazy } from "react"
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/pageNotFound';
import ScrollToTop from './components/ScrollToTop';
import CanvasBackground from './components/blog/CanvasBackground';
import ScrollProgress from './components/ScrollProgress';

// Every route below is its own chunk (React.lazy + dynamic import), so the
// initial bundle only ships the code the very first page needs -- the rest
// loads on navigation.
const Home = lazy(() => import('@/pages/Home'));
const ArticleDetail = lazy(() => import('@/pages/ArticleDetail'));
const Admin = lazy(() => import('@/pages/Admin'));
const Members = lazy(() => import('@/pages/Members'));
const DomainPage = lazy(() => import('@/pages/Domain'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const AboutPage = lazy(() => import('@/pages/About'));
const CodeOfConduct = lazy(() => import('@/pages/CodeOfConduct'));
const Join = lazy(() => import('@/pages/Join'));
const Contact = lazy(() => import('@/pages/Contact'));
const Embed = lazy(() => import('@/pages/Embed'));
const EmbedPost = lazy(() => import('@/pages/EmbedPost'));
const MemberLogin = lazy(() => import('@/pages/MemberLogin'));
const Portal = lazy(() => import('@/pages/Portal'));
const Projects = lazy(() => import('@/pages/Projects'));
const MemberProfile = lazy(() => import('@/pages/MemberProfile'));

const AppRoutes = () => (
    <Suspense fallback={null}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/members" element={<Members />} />
            <Route path="/member/:id" element={<MemberProfile />} />
            <Route path="/domain/:slug" element={<DomainPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/code-of-conduct" element={<CodeOfConduct />} />
            <Route path="/join" element={<Join />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/embed" element={<Embed />} />
            <Route path="/embed/post/:slug" element={<EmbedPost />} />
            <Route path="/member-login" element={<MemberLogin />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    </Suspense>
);

function App() {
    return (
        <QueryClientProvider client={queryClientInstance}>
            <Router>
                <ScrollToTop />
                <CanvasBackground />
                <ScrollProgress />
                <AppRoutes />
            </Router>
            <Toaster />
        </QueryClientProvider>
    )
}

export default App
