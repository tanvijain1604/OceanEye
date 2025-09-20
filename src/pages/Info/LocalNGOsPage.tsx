import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../components/Card'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'

export const LocalNGOsPage: React.FC = () => {
  const { t } = useTranslation()

  const ngos = [
    {
      name: 'Coastal Relief Foundation',
      description: 'Providing emergency relief and rehabilitation services to coastal communities affected by natural disasters.',
      contact: '+91-9876543210',
      email: 'info@coastalrelief.org',
      website: 'www.coastalrelief.org',
      services: ['Emergency Relief', 'Medical Aid', 'Food Distribution', 'Shelter'],
      location: 'Chennai, Tamil Nadu',
      established: '2010',
      volunteers: 500
    },
    {
      name: 'Ocean Safety Network',
      description: 'Dedicated to ocean safety education and emergency response training for fishing communities.',
      contact: '+91-9876543211',
      email: 'contact@oceansafety.org',
      website: 'www.oceansafety.org',
      services: ['Safety Training', 'Equipment Distribution', 'Rescue Operations', 'Awareness Programs'],
      location: 'Mumbai, Maharashtra',
      established: '2015',
      volunteers: 300
    },
    {
      name: 'Tsunami Response Team',
      description: 'Specialized in tsunami preparedness and rapid response for coastal areas.',
      contact: '+91-9876543212',
      email: 'help@tsunamiresponse.org',
      website: 'www.tsunamiresponse.org',
      services: ['Early Warning Systems', 'Evacuation Planning', 'Community Training', 'Recovery Support'],
      location: 'Visakhapatnam, Andhra Pradesh',
      established: '2005',
      volunteers: 750
    },
    {
      name: 'Marine Conservation Society',
      description: 'Working towards marine ecosystem protection and sustainable coastal development.',
      contact: '+91-9876543213',
      email: 'info@marineconservation.org',
      website: 'www.marineconservation.org',
      services: ['Environmental Protection', 'Research', 'Community Outreach', 'Policy Advocacy'],
      location: 'Kochi, Kerala',
      established: '2008',
      volunteers: 400
    },
    {
      name: 'Fishermen Welfare Association',
      description: 'Supporting fishing communities with safety equipment, training, and emergency assistance.',
      contact: '+91-9876543214',
      email: 'support@fishermenwelfare.org',
      website: 'www.fishermenwelfare.org',
      services: ['Safety Equipment', 'Insurance Support', 'Emergency Assistance', 'Skill Development'],
      location: 'Mangaluru, Karnataka',
      established: '2012',
      volunteers: 200
    },
    {
      name: 'Coastal Community Care',
      description: 'Providing healthcare and social services to remote coastal communities.',
      contact: '+91-9876543215',
      email: 'care@coastalcommunity.org',
      website: 'www.coastalcommunity.org',
      services: ['Healthcare', 'Education', 'Women Empowerment', 'Child Care'],
      location: 'Puri, Odisha',
      established: '2018',
      volunteers: 150
    }
  ]

  return (
    <div className="min-h-screen bg-primary-foam py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('ngos.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with local NGOs and community organizations working to keep coastal communities safe and prepared.
          </p>
        </motion.div>

        {/* NGO Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ngos.map((ngo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary-navy">
                      {ngo.name}
                    </h3>
                    <Badge variant="info" size="sm">
                      Est. {ngo.established}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {ngo.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <span className="text-lg mr-2">📍</span>
                      <span className="text-gray-700">{ngo.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-lg mr-2">👥</span>
                      <span className="text-gray-700">{ngo.volunteers} volunteers</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-lg mr-2">📞</span>
                      <span className="text-gray-700 font-mono">{ngo.contact}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-lg mr-2">📧</span>
                      <span className="text-gray-700">{ngo.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-lg mr-2">🌐</span>
                      <span className="text-gray-700">{ngo.website}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-primary-navy mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {ngo.services.map((service, serviceIndex) => (
                        <Badge key={serviceIndex} variant="outline" size="sm">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => window.open(`tel:${ngo.contact}`)}
                    >
                      {t('ngos.contact')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => window.open(`mailto:${ngo.email}`)}
                    >
                      {t('ngos.volunteer')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-primary-navy mb-4">
              Want to Make a Difference?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our community of volunteers and help make coastal areas safer for everyone. 
              Whether you can donate time, resources, or skills, every contribution matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                icon="🤝"
              >
                Become a Volunteer
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon="💝"
              >
                {t('ngos.donate')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon="📞"
              >
                Contact Us
              </Button>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}

export default LocalNGOsPage