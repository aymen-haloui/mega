// Mega Pizza - Footer

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-t from-background to-muted/20 border-t border-border/40">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Link to="/" className="flex items-center space-x-3">
              <MegaPizzaLogo size="lg" animate={true} />
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mega Pizza
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed text-lg">
              La meilleure pizza et cuisine italienne, 
              livrée directement à votre porte avec passion et authenticité.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-110">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="font-bold text-xl text-foreground">Liens Rapides</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <span className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-3"></span>
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/branches" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <span className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-3"></span>
                  Nos Restaurants
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <span className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-3"></span>
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <span className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-3"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="font-bold text-xl text-foreground">Nos Spécialités</h3>
            <ul className="space-y-4">
              <li>
                <span className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-lg">
                  Pizzas Classiques
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-lg">
                  Pizzas Gourmet
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-lg">
                  Pâtes Italiennes
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-lg">
                  Desserts Italiens
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <h3 className="font-bold text-xl text-foreground">Contact</h3>
            <ul className="space-y-5">
              <li className="flex items-center space-x-3 group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <span className="text-muted-foreground text-lg group-hover:text-foreground transition-colors duration-300">
                  Alger, Oran, Constantine
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <span className="text-muted-foreground text-lg group-hover:text-foreground transition-colors duration-300">
                  +213 555 123 456
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <span className="text-muted-foreground text-lg group-hover:text-foreground transition-colors duration-300">
                  contact@megapizza.com
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto"
        >
          <p className="text-muted-foreground text-lg font-medium">
            © {currentYear} Mega Pizza. Tous droits réservés.
          </p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary text-lg font-medium transition-all duration-300 hover:scale-105">
              Confidentialité
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary text-lg font-medium transition-all duration-300 hover:scale-105">
              Conditions d'utilisation
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};