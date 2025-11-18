import React from 'react';

export default function RoadmapPage() {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'Migration & Database Foundation',
      status: 'planned',
      timeline: 'Q1 2026',
      features: [
        'Google Sheets import tool for existing client database',
        'Data migration from Vergaro platform',
        'Client database management (profiles, contact info, history)',
        'Trainer profiles and employee records',
        'User authentication & role-based access (admin, trainers, clients)',
        'Migration testing environment with existing member base',
      ],
      color: 'from-blue-500 to-cyan-500',
      icon: '🔄',
    },
    {
      phase: 'Phase 2',
      title: 'Session & Membership Management',
      status: 'planned',
      timeline: 'Q2 2026',
      features: [
        'Training session booking and scheduling system',
        'Customizable session types (1-on-1, group, virtual)',
        'Membership tier management (1-year, 6-month, session-to-session)',
        'Automated twice-monthly billing for memberships',
        'Client visit tracking and session history',
        'Trainer schedule and availability management',
      ],
      color: 'from-purple-500 to-pink-500',
      icon: '📅',
    },
    {
      phase: 'Phase 3',
      title: 'Admin & Payroll System',
      status: 'planned',
      timeline: 'Q3 2026',
      features: [
        'Trainer paycheck calculation and management',
        'Price per session tracking and customization',
        'Employee details and HR information management',
        'Revenue reporting and financial analytics',
        'Automated payroll processing',
        'Admin dashboard for business oversight',
      ],
      color: 'from-green-500 to-emerald-500',
      icon: '💰',
    },
    {
      phase: 'Phase 4',
      title: 'Email Automation & Marketing',
      status: 'planned',
      timeline: 'Q4 2026',
      features: [
        'Replace HubSpot with integrated email system',
        'Automated marketing campaigns and sequences',
        'Transactional emails (bookings, payments, reminders)',
        'Client communication templates',
        'Email analytics and engagement tracking',
        'Customizable email workflows for business operations',
      ],
      color: 'from-orange-500 to-red-500',
      icon: '📧',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: 'bg-gray-100 text-gray-700 border-gray-300',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
      completed: 'bg-green-100 text-green-700 border-green-300',
    };
    return styles[status as keyof typeof styles] || styles.planned;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Vetted Trainers</h1>
            <p className="text-xl text-blue-100 mb-2">
              All-in-One Training Business Management Platform
            </p>
            <p className="text-lg text-blue-200">
              Replacing Vergaro, Google Sheets, and HubSpot with one powerful, customizable system
            </p>
          </div>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Vetted Trainers is a comprehensive platform designed to replace Vergaro and streamline 
            your entire training business. From migrating your existing Google Sheets database to 
            managing memberships, trainer schedules, payroll, and automated email marketing - we're 
            building a fully customizable solution tailored to your business needs. Say goodbye to 
            juggling multiple platforms and hello to one integrated system.
          </p>
        </div>

        {/* Key Challenges Being Solved */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Current Pain Points
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Vergaro lacks customization for business-specific needs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Multiple platforms (Vergaro, Google Sheets, HubSpot)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Manual data entry and synchronization issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Complex membership billing requirements</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Our Solutions
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Fully customizable to your business workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>All-in-one integrated platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Seamless data migration with testing environment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Automated billing tailored to your membership tiers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Development Roadmap
          </h2>
          
          {/* Timeline connector line */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 via-green-500 to-orange-500 hidden md:block"></div>
            
            <div className="space-y-8">
              {phases.map((phase, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-8 w-5 h-5 rounded-full bg-white border-4 border-current hidden md:block"
                       style={{ color: phase.color.split(' ')[0].replace('from-', '') }}>
                  </div>
                  
                  {/* Content Card */}
                  <div className="md:ml-20 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${phase.color} p-6 text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{phase.icon}</span>
                          <div>
                            <div className="text-sm font-semibold opacity-90">{phase.phase}</div>
                            <h3 className="text-2xl font-bold">{phase.title}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-4 py-1 rounded-full border-2 ${getStatusBadge(phase.status)} font-semibold text-sm mb-2`}>
                            {phase.status.charAt(0).toUpperCase() + phase.status.slice(1).replace('-', ' ')}
                          </div>
                          <div className="text-sm font-semibold">{phase.timeline}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-700 mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {phase.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-10 text-white text-center mt-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Migrate from Vergaro?</h2>
          <p className="text-lg text-blue-100 mb-6">
            Let's discuss your specific business needs and create a customized migration plan that preserves your client relationships
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-200">
              Schedule a Demo
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200">
              Learn More
            </button>
          </div>
        </div>

        {/* Platform Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-600">Smooth Data Migration</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">3-in-1</div>
            <div className="text-gray-600">Platform Consolidation</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">Custom</div>
            <div className="text-gray-600">Built for Your Business</div>
          </div>
        </div>
      </div>
    </div>
  );
}

