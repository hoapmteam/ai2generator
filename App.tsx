
import React, { useState, useCallback, useMemo } from 'react';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import { generateSceneImages } from './services/geminiService';
import DownloadIcon from './components/icons/DownloadIcon';

const App: React.FC = () => {
    const [productImages, setProductImages] = useState<(File | null)[]>(Array(4).fill(null));
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const productImagePreviews = useMemo(() => {
        return productImages.map(file => file ? URL.createObjectURL(file) : null);
    }, [productImages]);

    const handleImageChange = useCallback((index: number, file: File | null) => {
        setProductImages(prev => {
            const newImages = [...prev];
            newImages[index] = file;
            return newImages;
        });
    }, []);

    const isGenerationDisabled = useMemo(() => {
        return isLoading || !prompt.trim() || productImages.some(img => img === null);
    }, [isLoading, prompt, productImages]);

    const handleGenerate = async () => {
        const validImages = productImages.filter((img): img is File => img !== null);
        if (validImages.length !== 4 || !prompt.trim()) {
            setError("Vui lòng tải lên đủ 4 ảnh sản phẩm và nhập yêu cầu.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const images = await generateSceneImages(validImages, prompt);
            setGeneratedImages(images);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                        AI Product Scene Generator
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">
                        Tải ảnh sản phẩm và mô tả bối cảnh bạn muốn, AI sẽ tạo ra hình ảnh minh hoạ.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-lg flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-white">1. Tải ảnh sản phẩm (4 ảnh)</h2>
                            <p className="text-sm text-gray-400 mb-4">Cung cấp hình ảnh rõ nét của sản phẩm từ nhiều góc độ.</p>
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <ImageUploader
                                        key={index}
                                        id={`image-upload-${index}`}
                                        onImageChange={(file) => handleImageChange(index, file)}
                                        previewUrl={productImagePreviews[index]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-white">2. Nhập yêu cầu của bạn</h2>
                            <p className="text-sm text-gray-400 mb-4">Mô tả bối cảnh, người dùng, hoặc tính năng cần làm nổi bật.</p>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ví dụ: một người phụ nữ đang chạy bộ trong công viên vào buổi sáng, đeo tai nghe màu trắng..."
                                className="w-full h-32 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-gray-200 placeholder-gray-500 resize-none"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerationDisabled}
                            className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary disabled:bg-base-300 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
                        >
                            {isLoading && <Spinner />}
                            {isLoading ? 'Đang tạo...' : 'Tạo ảnh'}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center">
                        <h2 className="text-2xl font-bold mb-4 text-white">Kết quả</h2>
                        {isLoading ? (
                            <div className="w-full grid grid-cols-2 gap-4 animate-pulse">
                                <div className="aspect-square bg-base-300 rounded-lg"></div>
                                <div className="aspect-square bg-base-300 rounded-lg"></div>
                                <div className="aspect-square bg-base-300 rounded-lg"></div>
                                <div className="aspect-square bg-base-300 rounded-lg"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                                <p className="font-bold">Lỗi!</p>
                                <p>{error}</p>
                            </div>
                        ) : generatedImages.length > 0 ? (
                            <div className="w-full grid grid-cols-2 gap-4">
                                {generatedImages.map((src, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <img 
                                            src={src} 
                                            alt={`Generated scene ${index + 1}`} 
                                            className="w-full h-full object-cover rounded-lg shadow-md" 
                                        />
                                        <a
                                            href={src}
                                            download={`generated-scene-${index + 1}.png`}
                                            className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-300 focus:ring-brand-primary"
                                            aria-label={`Tải xuống ảnh ${index + 1}`}
                                            title={`Tải xuống ảnh ${index + 1}`}
                                        >
                                            <DownloadIcon className="w-5 h-5" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <p>Ảnh của bạn sẽ xuất hiện ở đây.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
