const BlogPage = () => {
    return (
        <div className="container-custom py-16">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Travel Blog</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Read amazing stories, tips, and guides from our vibrant travel community in Nepal. Stay tuned as we publish our first articles!
                </p>
                <div className="bg-primary-50 text-primary-700 p-8 rounded-2xl border border-primary-100">
                    <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
                    <p>We are currently gathering incredible stories. Check back soon for updates.</p>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
