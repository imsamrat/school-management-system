import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const PrincipalMessage = () => {
  return (
    <section id="principal-message" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-12">
            Message from the Principal
          </h2>

          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardContent className="p-8 sm:p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-12">
                {/* Principal Photo */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-blue-100">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                        alt="Dr. Ayesha Rahman, Principal"
                        width={224}
                        height={224}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Decorative ring */}
                    <div className="absolute -inset-4 rounded-full border-2 border-blue-200 opacity-30"></div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 text-left">
                  <blockquote className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-8 font-light italic">
                    "At Greenfield International School, we believe education is
                    more than academics — it's about nurturing curiosity,
                    empathy, and excellence. Together, we prepare our students
                    for success in an ever-changing world."
                  </blockquote>

                  <div className="border-l-4 border-blue-600 pl-6">
                    <p className="text-xl font-semibold text-gray-900 mb-1">
                      Dr. Ayesha Rahman
                    </p>
                    <p className="text-blue-600 font-medium">Principal</p>
                  </div>

                  {/* Additional message content */}
                  <div className="mt-8 space-y-4 text-gray-600 text-base lg:text-lg">
                    <p>
                      With over 20 years of experience in education, I am
                      committed to fostering an environment where every student
                      can thrive academically, socially, and personally.
                    </p>
                    <p>
                      Our dedicated faculty and state-of-the-art facilities
                      create endless opportunities for learning, growth, and
                      discovery. We invite you to be part of our vibrant school
                      community.
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="flex justify-center mt-12">
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <div className="mt-12">
            <p className="text-gray-600 mb-4">
              Learn more about our academic programs and admission process
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                Explore Academics
              </button>
              <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium">
                Admission Information
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrincipalMessage;
