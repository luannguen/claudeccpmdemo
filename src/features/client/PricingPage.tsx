import React from 'react';
import { useNavigate } from 'react-router-dom';

const PricingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSelectPlan = (plan: string) => {
        navigate(`/register?plan=${plan}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-4 text-xl text-gray-500">
                        Choose the plan that's right for your business.
                    </p>
                </div>

                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
                    {/* Basic Plan */}
                    <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">Basic</h2>
                            <p className="mt-4 text-sm text-gray-500">Perfect for getting started.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                                <span className="text-base font-medium text-gray-500">/mo</span>
                            </p>
                            <button
                                onClick={() => handleSelectPlan('basic')}
                                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
                            >
                                Start for free
                            </button>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">Pro</h2>
                            <p className="mt-4 text-sm text-gray-500">For growing businesses.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">$29</span>
                                <span className="text-base font-medium text-gray-500">/mo</span>
                            </p>
                            <button
                                onClick={() => handleSelectPlan('pro')}
                                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
                            >
                                Get started
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
