import React, { useEffect, useState } from 'react';
import ServiceCard from '../../components/ServiceCard';
import type { Service } from '../../types/Service';
import { getAll } from '../../services/serviceService';
import HeaderHome from '../../components/HeaderHome';
import Header from '../../components/Header';

const ServiceList = () => {
    const [services, setServices] = useState<Service[] | null>(null);
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [showSolidHeader, setShowSolidHeader] = useState(false);
  

   useEffect(() => {

       setLoading(true);
       setError(null);

       getAll()
           .then((data: Service[]) => {
               setServices(Array.isArray(data) ? data : []);
           })
           .catch((err: Error) => {
               setError(err?.message || 'Error loading services');
           })
       .finally(() => setLoading(false));
    
   }, []);
  console.log('Fetched services:', services);
    // categorize
    const laundry = (services ?? []).filter((s) =>
      (s.serviceCategory ?? '').toUpperCase().includes('LAUNDRY'),
    );
    const food = (services ?? []).filter(
        (s) =>
            (s.serviceCategory ?? '').toUpperCase().includes('FOOD') ||
            (s.serviceCategory ?? '').toUpperCase().includes('BEVERAGE'),
    );
    const others = (services ?? []).filter(
        (s) => !laundry.includes(s) && !food.includes(s),
  );
   // 👉 Khi scroll hơn 10px là đổi header ngay
      useEffect(() => {
          const handleScroll = () => {
              if (window.scrollY > 10) {
                  setShowSolidHeader(true);
              } else {
                  setShowSolidHeader(false);
              }
          };
  
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
      }, []);

  return (
      <div>
          {/* Header chuyển đổi */}
          <div className="fixed top-0 left-0 w-full z-[9999] transition-all duration-700">
              {/* Header trong suốt ban đầu */}
              <div
                  className={`transition-opacity duration-700 ${
                      showSolidHeader
                          ? 'opacity-0 pointer-events-none'
                          : 'opacity-100'
                  }`}
              >
                  <HeaderHome />
              </div>

              {/* Header solid khi scroll lên */}
              <div
                  className={`absolute top-0 left-0 w-full transition-opacity duration-700 ${
                      showSolidHeader
                          ? 'opacity-100'
                          : 'opacity-0 pointer-events-none'
                  }`}
              >
                  <Header />
              </div>
          </div>

          <div className="font-sans">
              {/* Hero Banner with fixed background */}
              <div
                  className="relative h-[80vh] bg-cover bg-center bg-fixed"
                  style={{
                      backgroundImage:
                          "url('https://res.cloudinary.com/dk8gvar3y/image/upload/v1760002659/snapedit_1760002631640_fkoka9.jpg')",
                  }}
              />

              {/* Main Content Container with overlapping banner */}
              <div className="w-[95%] mx-auto bg-gradient-to-b from-[#F8EBD6] to-white -mt-20 relative z-10 rounded-t-3xl shadow-xl">
                  {/* Statistics Section */}
                  <div className="py-16">
                      <div className="max-w-6xl mx-auto px-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-300">
                              <div className="text-center px-8">
                                  <h3 className="text-5xl font-bold text-blue-500 mb-3">
                                      50+
                                  </h3>
                                  <p className="text-xl font-bold text-gray-900 mb-3">
                                      Services
                                  </p>
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                      A dedication to unique flavors and
                                      heartfelt service, celebrating your palate
                                  </p>
                              </div>

                              <div className="text-center px-8">
                                  <h3 className="text-5xl font-bold text-blue-500 mb-3">
                                      120+
                                  </h3>
                                  <p className="text-xl font-bold text-gray-900 mb-3">
                                      Dish
                                  </p>
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                      A dedication to unique flavors and
                                      heartfelt service, celebrating your palate
                                  </p>
                              </div>

                              <div className="text-center px-8">
                                  <h3 className="text-5xl font-bold text-blue-500 mb-3">
                                      5+
                                  </h3>
                                  <p className="text-xl font-bold text-gray-900 mb-3">
                                      Stars
                                  </p>
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                      A dedication to unique flavors and
                                      heartfelt service, celebrating your palate
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Service List Section */}
                  <div className="max-w-7xl mx-auto py-16 bg-transparent">
                      {loading && (
                          <div className="text-center py-10">
                              Loading services…
                          </div>
                      )}
                      {error && (
                          <div className="text-center py-10 text-red-600">
                              {error}
                          </div>
                      )}

                      {!loading && !error && (
                          <>
                              {/* Laundry Services */}
                              <section className="mb-16">
                                  <div className="flex gap-10">
                                      <div className="w-64 flex-shrink-0">
                                          <h3 className="text-2xl font-bold mb-4">
                                              Laundry
                                          </h3>
                                          <p className="text-gray-700 text-sm leading-relaxed">
                                              We offer professional laundry
                                              services, including washing,
                                              drying, and folding, to make your
                                              life easier.
                                          </p>
                                      </div>

                                      <div className="flex-1">
                                          {laundry.length === 0 ? (
                                              <div className="text-sm text-gray-600">
                                                  No laundry services available.
                                              </div>
                                          ) : (
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                  {laundry.map((s) => (
                                                      <ServiceCard
                                                          key={
                                                              s.serviceID ??
                                                              s.serviceName
                                                          }
                                                          service={s as Service}
                                                      />
                                                  ))}
                                              </div>
                                          )}
                                          <div className="text-right mt-6">
                                              <a
                                                  href="#"
                                                  className="text-blue-600 hover:underline text-sm font-medium"
                                              >
                                                  Read more
                                              </a>
                                          </div>
                                      </div>
                                  </div>
                              </section>

                              {/* Food and Beverage Services */}
                              <section className="mb-16">
                                  <div className="flex gap-8">
                                      <div className="w-64 flex-shrink-0">
                                          <h3 className="text-2xl font-bold mb-4">
                                              Food and Beverage
                                          </h3>
                                          <p className="text-gray-700 text-sm leading-relaxed">
                                              To awaken every sense, to elevate
                                              with exquisite flavors. Crafted
                                              with passion and mastery, indulge
                                              in our sumptuous coffees.
                                          </p>
                                      </div>

                                      <div className="flex-1">
                                          {food.length === 0 ? (
                                              <div className="text-sm text-gray-600">
                                                  No food & beverage services
                                                  available.
                                              </div>
                                          ) : (
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                  {food.map((s) => (
                                                      <ServiceCard
                                                          key={
                                                              s.serviceID ??
                                                              s.serviceName
                                                          }
                                                          service={s as Service}
                                                      />
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </section>

                              {/* Other services */}
                              {others.length > 0 && (
                                  <section className="mb-16">
                                      <h3 className="text-2xl font-bold mb-6">
                                          Other Services
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                          {others.map((s) => (
                                              <ServiceCard
                                                  key={
                                                      s.serviceID ??
                                                      s.serviceName
                                                  }
                                                  service={s as Service}
                                              />
                                          ))}
                                      </div>
                                  </section>
                              )}
                          </>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );
};

export default ServiceList;
