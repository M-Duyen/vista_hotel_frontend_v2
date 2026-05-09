import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import Dashboard from '../dashboard/Dashboard';
import BookingTable from './BookingTable';

function BookingManagement() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Dashboard />
                <main className="flex-1 bg-[#d4c5b9] p-6">
                    <BookingTable />
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default BookingManagement;
