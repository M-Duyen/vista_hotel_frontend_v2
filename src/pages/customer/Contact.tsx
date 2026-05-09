import React, { useEffect, useState } from 'react';
import HeaderHome from '../../components/HeaderHome';
import Header from '../../components/Header';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [status, setStatus] = useState<string | null>(null);
    const [showSolidHeader, setShowSolidHeader] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form data:', formData);

        setStatus('success');
        setTimeout(() => setStatus(null), 3000);

        setFormData({
            name: '',
            email: '',
            message: '',
        });
    };

    // Cuộn lên đầu trang
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Khi scroll hơn 10px là đổi header ngay
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
        <div className="bg-gray-50">
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

            {/* Banner */}
            <div className="text-center mb-8 fixed top-0 left-0 right-0 z-10">
                <img
                    src="https://res.cloudinary.com/duongofji/image/upload/v1763548357/contact_obwd7h.png"
                    alt="Contact Us"
                    className="mx-auto w-full h-auto object-cover brightness-50 contact-us-container"
                />
            </div>

            {/* Main content */}
            <div className="relative h-full mt-[35vw] z-20 bg-white items-center justify-items-center">
                <h1 className="text-center font-semibold text-5xl mb-4 absolute top-[-120px] left-1/2 -translate-x-1/2 text-white">
                    CONTACT US
                </h1>

                <p className="text-center text-sm py-8 text-gray-500">
                    Hotel Client Service Center is available from Monday <br />
                    to Sunday 24/7. <br />
                    Our Client Advisors will be delighted to assist you and
                    provide personalized advice. <br />
                    For support regarding services, please fill out the form
                    below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mt-10 max-w-[60vw]">
                    {/* FORM */}
                    <div className="pr-10">
                        <p className="text-lg font-semibold">Write us</p>
                        <form onSubmit={handleSubmit}>
                            {/* Full name */}
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                                    placeholder=" "
                                />
                                <label
                                    className="absolute left-0 top-1 text-sm text-gray-500 transition-all 
                                    peer-placeholder-shown:top-5 peer-placeholder-shown:text-base 
                                    peer-focus:top-1 peer-focus:text-sm"
                                >
                                    Full name
                                </label>
                            </div>

                            {/* Email */}
                            <div className="relative w-full mt-7">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                                    placeholder=" "
                                />
                                <label
                                    className="absolute left-0 top-1 text-sm text-gray-500 transition-all 
                                    peer-placeholder-shown:top-5 peer-placeholder-shown:text-base 
                                    peer-focus:top-1 peer-focus:text-sm"
                                >
                                    Email
                                </label>
                            </div>

                            {/* Message */}
                            <div className="relative w-full mt-7 mb-6">
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    required
                                    className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                                    placeholder=" "
                                />
                                <label
                                    className="absolute left-0 top-1 text-sm text-gray-500 transition-all 
                                    peer-placeholder-shown:top-5 peer-placeholder-shown:text-base 
                                    peer-focus:top-1 peer-focus:text-sm"
                                >
                                    Message
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-5 py-3 mb-5 text-lg text-white rounded-md"
                                style={{ backgroundColor: '#B6C99B' }}
                            >
                                Send
                            </button>
                        </form>

                        {status === 'success' && (
                            <p className="text-green-600 text-center mt-2">
                                Gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm
                                nhất.
                            </p>
                        )}
                    </div>

                    {/* CONTACT INFO */}
                    <div>
                        <p className="text-lg font-medium">Contact us</p>
                        <p className="text-gray-500 text-sm mt-3">
                            Our Client Advisors would be delighted to assist
                            you. <br />
                            You may contact us at (00) 399 778 8390. <br />
                            Service available Monday–Sunday, 10AM–9PM.
                        </p>

                        <div className="mt-5">
                            <div className="flex py-2">
                                <i className="fa-solid fa-phone mt-1"></i>
                                <p className="ml-2 text-sm text-gray-500">
                                    (00) 399 778 8390
                                </p>
                            </div>

                            <div className="flex py-2">
                                <i className="fa-solid fa-location-dot mt-1"></i>
                                <p className="ml-3 text-sm text-gray-500">
                                    365 Nguyen Van Bao Street, Go Vap District,
                                    HCM
                                </p>
                            </div>

                            <div className="flex py-2">
                                <i className="fa-solid fa-envelope mt-1"></i>
                                <p className="ml-2 text-sm text-gray-500">
                                    Vistahotel@gmail.com.vn
                                </p>
                            </div>
                        </div>

                        <p className="mt-10 text-sm text-gray-500 text-justify">
                            By clicking "Send", you confirm that you have read
                            the Privacy Statement and agree to Vélvere's
                            processing of your personal data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
