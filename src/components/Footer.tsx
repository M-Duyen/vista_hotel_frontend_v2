const Footer: React.FC = () => {
    return (
        <footer className="bg-[#F5F0EB] text-black">
            <div className="font-serif pt-10 pb-10">
                <h2 className="text-center text-5xl tracking-widest">VISTA</h2>
                <p className="text-center">LUXURY HOTEL</p>
            </div>

            <div className="max-w-[90vw] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 text-sm">
                {/* Giới thiệu */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">INTRODUCE</h3>
                    <hr className="w-10 border-black mb-3" />
                    <p className="text-sm">
                        Experience unparalleled luxury and impeccable service at
                        Vista Hotel, where every detail is crafted for your
                        comfort and pleasure.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">QUICK LINKS</h3>
                    <hr className="w-10 border-black mb-3" />
                    <ul className="space-y-1">
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Dashboard
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Room Management
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Reservations
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Guest Services
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Reports & Analytics
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Help */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">HELP</h3>
                    <hr className="w-10 border-black mb-3" />
                    <ul className="space-y-1">
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                FAQ
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Support
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Terms of Service
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">CONTACT</h3>
                    <hr className="w-10 border-black mb-3" />
                    <ul className="space-y-1 text-sm">
                        <li>
                            <i className="fas fa-map-marker-alt mr-2" />
                            123 Luxury Avenue, Skyline District
                        </li>
                        <li>
                            <i className="fas fa-phone mr-2" />
                            +1 (555) 123-4567
                        </li>
                        <li>
                            <i className="fas fa-envelope mr-2" />
                            info@vistahotel.com
                        </li>
                    </ul>
                </div>

                {/* Connect With Us */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">
                        CONNECT WITH US
                    </h3>
                    <hr className="w-10 border-black mb-3" />
                    <p className="text-sm mb-3">
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy
                        liên hệ với Vista Hotel để được tư vấn và đặt phòng
                        nhanh chóng.
                    </p>
                    <div className="flex space-x-3">
                        <a
                            href="#"
                            className="text-gray-700 hover:text-blue-600"
                        >
                            <i className="fab fa-facebook-f text-xl" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-700 hover:text-blue-600"
                        >
                            <i className="fab fa-twitter text-xl" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-700 hover:text-pink-500"
                        >
                            <i className="fab fa-instagram text-xl" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-700 hover:text-blue-800"
                        >
                            <i className="fab fa-linkedin-in text-xl" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-700 hover:text-yellow-800"
                        >
                            <i className="fab fa-snapchat text-xl" />
                        </a>
                        <a href="#" className="text-gray-700 hover:text-black">
                            <i className="fab fa-tiktok text-xl" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-700 hover:text-red-800"
                        >
                            <i className="fab fa-youtube text-xl" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-300 mt-10 pt-6 pb-6 text-center text-black text-xs">
                <p className="mb-2">
                    © 2025 Vista Hotel |
                    <a href="#" className="hover:text-blue-600">
                        {' '}
                        Terms
                    </a>{' '}
                    |
                    <a href="#" className="hover:text-blue-600">
                        {' '}
                        Privacy
                    </a>{' '}
                    |
                    <a href="#" className="hover:text-blue-600">
                        {' '}
                        Accessibility
                    </a>{' '}
                    |
                    <a href="#" className="hover:text-blue-600">
                        {' '}
                        Website Feedback
                    </a>{' '}
                    |
                    <a href="#" className="hover:text-blue-600">
                        {' '}
                        Complaints
                    </a>{' '}
                    | ABN 94 512 846 231
                </p>
                <p>
                    Vista Hospitality Group Pty Ltd, trading as Vista Hotel &
                    Resorts. CRICOS Provider Code: 01912G
                </p>
            </div>
        </footer>
    );
};

export default Footer;
