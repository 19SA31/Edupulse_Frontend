import React, { useState, useEffect } from "react";
import { Play, Users, BookOpen, Award, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllListedTutors,
  getAllCourses,
  getAllListedCategories,
} from "../../services/userService";
import {
  TutorListingUser,
  CourseListingUser,
  CategoryListingUser,
} from "../../interfaces/userInterface";

interface FAQ {
  question: string;
  answer: string;
}

function Banner() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [tutors, setTutors] = useState<TutorListingUser[]>([]);
  const [courses, setCourses] = useState<CourseListingUser[]>([]);
  const [categories, setCategories] = useState<CategoryListingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      question: "What is the cost?",
      answer:
        "EduPulse offers flexible pricing plans starting from ₹499/month. We also provide annual subscriptions at discounted rates, and occasional seasonal offers.",
    },
    {
      question: "Can I cancel my course?",
      answer:
        "Yes! You can cancel your course subscription anytime through your dashboard. After cancellation, you will retain access until the end of your billing period.",
    },
    {
      question: "What is your Class?",
      answer:
        "EduPulse Classes are pre-recorded, you can also book interactive sessions conducted by experienced tutors.",
    },
    {
      question: "Can I download courses?",
      answer:
        "Course download availability depends on your subscription plan and instructor permissions.",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tutorsResponse, coursesResponse, categoriesResponse] =
          await Promise.all([
            getAllListedTutors(),
            getAllCourses(),
            getAllListedCategories(),
          ]);
        setTutors(tutorsResponse?.data || []);
        setCourses(coursesResponse?.data || []);
        setCategories(categoriesResponse?.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const stats = [
    {
      number: `${courses.length}+`,
      label: "COURSES",
      color: "from-yellow-400 to-orange-500",
    },
    {
      number: "",
      label: "MEMBERS",
      color: "from-blue-500 to-cyan-400",
    },
    {
      number: `${tutors.length}+`,
      label: "TEACHERS",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "",
      label: "RATINGS",
      color: "from-green-500 to-emerald-400",
    },
  ];

  if (loading) {
    return (
      <section className="bg-black relative w-full min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-black relative w-full min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-2xl">{error}</div>
      </section>
    );
  }

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    const nextSibling = target.nextElementSibling as HTMLElement;
    if (nextSibling) {
      nextSibling.style.display = "flex";
    }
  };

  const handleTutorImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
  };

  const handleJoinTutorImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.src =
      "https://via.placeholder.com/800x400/059669/ffffff?text=Join+Our+Teaching+Community";
  };

  return (
    <>
      <section className="bg-black relative w-full min-h-screen flex flex-col px-4 py-16">
        <div className="flex-1 flex flex-col items-center justify-center text-center mb-20">
          <div className="text-white max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
              Master New Skills with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
                EduPulse
              </span>
            </h1>
            <p className="text-lg lg:text-xl mb-12 text-gray-300 leading-relaxed">
              Unlock your potential with expert-led courses, interactive
              learning experiences, and personalized education paths designed
              for the modern learner.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              onClick={() => (window.location.href = "/login")}
            >
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                Start Learning Today
              </button>
              <button className="border-2 border-white/30 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                Explore Courses
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-yellow-300 to-yellow-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              Why Students Love EduPulse
            </h2>
            <p className="text-xl text-black max-w-4xl mx-auto">
              Whether it's a first brush on canvas or the last frame in an
              animation, EduPulse is here to support you on every step of your
              creative journey.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                  <div
                    className={`text-4xl lg:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
                  >
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-300 group-hover:text-white transition-colors">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-8 text-white">
              EXPLORE INSPIRING COURSES
            </h2>

            {categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {categories.map((category) => (
                  <button
                    key={category.categoryId}
                    className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 bg-gray-800 text-white border border-gray-600 
             transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:text-black "
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {courses.length > 0 ? (
            <>
              <div className="max-w-7xl mx-auto px-4 mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                  {courses.slice(0,4).map((course) => (
                    <div
                      key={course.courseId}
                      className="w-full bg-gray-900 rounded-2xl overflow-hidden hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group flex flex-col"
                      style={{ minHeight: "400px" }}
                    >
                      <div className="relative h-48 flex-shrink-0">
                        {course.thumbnailImage ? (
                          <img
                            src={course.thumbnailImage}
                            alt={course.title}
                            className="h-full w-full object-cover"
                            onError={handleImageError}
                          />
                        ) : null}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"
                          style={{
                            display: course.thumbnailImage ? "none" : "flex",
                          }}
                        >
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                            {course.categoryName}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4 flex-grow flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{course.enrollmentCount || 0} students</span>
                        </div>

                        <h3 className="text-lg text-white font-semibold leading-tight group-hover:text-yellow-400 transition-colors line-clamp-2">
                          {course.title}
                        </h3>

                        <div className="text-sm text-gray-400 mt-auto">
                          By {course.tutorName}
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-yellow-400">
                              ₹{course.price}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Link to={"/course-listing"}>
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
                    View All Courses
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p className="text-xl">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-white">
              Learn from Creative Experts
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Our classes are taught by industry leaders excited to share their
              tools, techniques, and professional journeys with you.
            </p>
          </div>

          {tutors.length > 0 ? (
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8">
                {tutors.slice(0, 4).map((tutor) => (
                  <div key={tutor.tutorId} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 h-80 mb-6">
                      {tutor.avatar ? (
                        <img
                          src={tutor.avatar}
                          alt={tutor.name}
                          className="w-full h-full object-cover object-top"
                          onError={handleTutorImageError}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <h3 className="text-3xl font-bold text-white mb-3">
                          {tutor.name}
                        </h3>
                        <p className="text-white/90 text-lg">
                          {tutor.designation}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {tutor.isListed && (
                        <div className="absolute top-6 right-6">
                          <div className="bg-green-500 rounded-full p-2">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-gray-400/25 transition-all duration-300 transform hover:scale-105">
                  And more...
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p className="text-xl">No tutors available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-4xl mx-auto">
            <div
              className="relative group overflow-hidden rounded-xl cursor-pointer"
              onClick={() => (window.location.href = "/tutor/login")}
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop"
                alt="Join as a Tutor"
                className="w-full h-64 lg:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={handleJoinTutorImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-teal-900/70 group-hover:from-green-900/80 group-hover:to-teal-900/80 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Become a Tutor
                </h2>
                <p className="text-lg lg:text-xl mb-6 max-w-2xl">
                  Share your expertise and inspire learners worldwide. Join our
                  community of passionate educators.
                </p>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30">
                  <span className="text-lg font-semibold">
                    Click to Join Us
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-white font-bold mb-6">
              Frequently asked questions?
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 text-white">
            {faqs.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${
                      openIndex === index ? "rotate-90" : ""
                    }`}
                  />
                </div>
                {openIndex === index && (
                  <p className="mt-4 text-gray-300">{item.answer}</p>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-400 mb-6">
              If you have any concerns or issues, contact us.
            </p>
            <div className="flex justify-center gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="text-white bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Banner;
