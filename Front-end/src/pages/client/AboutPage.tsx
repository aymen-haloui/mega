import { motion } from 'framer-motion';
import { 
  Info, 
  Heart, 
  Star, 
  Users, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe,
  Award,
  Target,
  CheckCircle,
  Building2,
  Utensils,
  Truck,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';
import { LogoBackground } from '@/components/ui/LogoBackground';
import { useNavigate } from 'react-router-dom';

export const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { number: '15+', label: 'Années d\'Expérience', icon: Award },
    { number: '50+', label: 'Branches', icon: Building2 },
    { number: '1000+', label: 'Employés', icon: Users },
    { number: '100K+', label: 'Clients Satisfaits', icon: Heart }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Qualité Premium',
      description: 'Nous sélectionnons uniquement les meilleurs ingrédients pour garantir une qualité exceptionnelle dans chaque plat.'
    },
    {
      icon: Shield,
      title: 'Sécurité Alimentaire',
      description: 'Nos restaurants respectent les plus hauts standards d\'hygiène et de sécurité alimentaire.'
    },
    {
      icon: Users,
      title: 'Service Client',
      description: 'Notre équipe dédiée s\'engage à offrir un service personnalisé et attentionné à chaque client.'
    },
    {
      icon: Target,
      title: 'Innovation Continue',
      description: 'Nous innovons constamment pour améliorer l\'expérience client et élargir notre offre culinaire.'
    }
  ];

  const milestones = [
    { year: '2008', title: 'Fondation', description: 'Création de la première branche Mega Pizza à Alger' },
    { year: '2012', title: 'Expansion', description: 'Ouverture de 10 nouvelles branches dans différentes villes' },
    { year: '2016', title: 'Digitalisation', description: 'Lancement de la plateforme de commande en ligne' },
    { year: '2020', title: 'Innovation', description: 'Introduction de la livraison express et du drive-through' },
    { year: '2024', title: 'Leader', description: 'Mega Pizza devient le leader du secteur de la restauration rapide' }
  ];

  const team = [
    { name: 'Ahmed Benali', role: 'PDG & Fondateur', image: '/api/placeholder/100/100' },
    { name: 'Fatima Zohra', role: 'Directrice Marketing', image: '/api/placeholder/100/100' },
    { name: 'Karim Boudiaf', role: 'Directeur Opérations', image: '/api/placeholder/100/100' },
    { name: 'Amina Tabet', role: 'Chef Cuisine', image: '/api/placeholder/100/100' }
  ];

  return (
    <div className="relative min-h-screen">
      <LogoBackground intensity="low" speed="slow" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <MegaPizzaLogo size="xl" animate={true} />
              <h1 className="text-5xl font-bold text-foreground mb-4">
                À Propos de Mega Pizza
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Découvrez l'histoire passionnante de notre entreprise familiale, 
                devenue le leader de la restauration rapide en Algérie
              </p>
            </motion.div>
          </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="card-gradient hover-scale text-center">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-full bg-muted/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <stat.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Notre Histoire
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Algeria Eats est née d'une passion pour la cuisine traditionnelle algérienne 
              et d'un désir de la rendre accessible à tous. Fondée en 2008 par Ahmed Benali, 
              notre entreprise a commencé comme un petit restaurant familial à Alger.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Aujourd'hui, nous sommes fiers d'être présents dans plus de 50 villes à travers 
              l'Algérie, servant des milliers de clients chaque jour avec notre engagement 
              inébranlable envers la qualité et l'excellence.
            </p>
            <Button onClick={() => navigate('/')} className="btn-primary">
              Découvrir Notre Menu
            </Button>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
              <Utensils className="h-32 w-32 text-primary" />
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Nos Valeurs
            </h2>
            <p className="text-muted-foreground text-lg">
              Les principes qui guident chacune de nos actions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="card-gradient hover-scale h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Milestones Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Notre Parcours
            </h2>
            <p className="text-muted-foreground text-lg">
              Les étapes clés de notre développement
            </p>
          </div>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px w-0.5 h-full bg-border"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="card-gradient hover-scale">
                      <CardContent className="p-6">
                        <div className={`${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                          <Badge variant="outline" className="mb-2">
                            {milestone.year}
                          </Badge>
                          <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                          <p className="text-muted-foreground">{milestone.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Notre Équipe
            </h2>
            <p className="text-muted-foreground text-lg">
              Les talents qui font d'Algeria Eats une entreprise exceptionnelle
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
              >
                <Card className="card-gradient hover-scale text-center">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 bg-muted/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                    <p className="text-muted-foreground text-sm">{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="card-gradient">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Contactez-Nous
                </h2>
                <p className="text-muted-foreground text-lg">
                  Nous sommes là pour répondre à toutes vos questions
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">Téléphone</h3>
                  <p className="text-muted-foreground">+213 21 23 45 67</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="p-3 rounded-full bg-secondary/10 w-16 h-16 mx-auto flex items-center justify-center">
                    <Mail className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">contact@algeriaeats.dz</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="p-3 rounded-full bg-accent/10 w-16 h-16 mx-auto flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold">Adresse</h3>
                  <p className="text-muted-foreground">123 Rue de la Paix, Alger</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};
