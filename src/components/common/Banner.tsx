import React from 'react';

function Banner() {
  
  const courseImages = [
    {
      src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      alt: "Programming Course",
      title: "Programming"
    },
    {
      src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
      alt: "Language Learning",
      title: "Languages"
    },
    {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      alt: "Data Analytics",
      title: "Data Analytics"
    },
    {
      src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop",
      alt: "Photography",
      title: "Photography"
    }
  ];

  return (
    <section className="bg-black relative w-full min-h-screen flex flex-col px-4 py-16">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mb-20">
        <div className="text-white max-w-4xl">
          <h1 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
            Master New Skills with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
              EduPulse
            </span>
          </h1>
          <p className="text-lg lg:text-xl mb-12 text-gray-300 leading-relaxed">
            Unlock your potential with expert-led courses, interactive learning experiences, 
            and personalized education paths designed for the modern learner.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              Start Learning Today
            </button>
            <button className="border-2 border-white/30 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Explore Courses
            </button>
          </div>
        </div>
      </div>

      {/* 2x2 Images Grid Below Buttons */}
      <div className="w-full max-w-5xl mx-auto mb-16">
        <div className="grid grid-cols-2 gap-8">
          {courseImages.map((image, index) => (
            <div key={index} className="relative group overflow-hidden rounded-xl cursor-pointer">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-80 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/500x400/1f2937/ffffff?text=${encodeURIComponent(image.title)}`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-semibold text-xl">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
        
        {/* Explore More Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-8 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            Explore More Courses
          </button>
        </div>
      </div>

      {/* Tutor Section */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative group overflow-hidden rounded-xl cursor-pointer" onClick={() => window.location.href = '/tutor/login'}>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop"
            alt="Join as a Tutor"
            className="w-full h-64 lg:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x400/059669/ffffff?text=Join+Our+Teaching+Community';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-teal-900/70 group-hover:from-green-900/80 group-hover:to-teal-900/80 transition-colors duration-300"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Become a Tutor
            </h2>
            <p className="text-lg lg:text-xl mb-6 max-w-2xl">
              Share your expertise and inspire learners worldwide. Join our community of passionate educators.
            </p>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30">
              <span className="text-lg font-semibold">Click to Join Us</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;