import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileCheck,
  Shirt,
  Users,
  Baby,
  ArrowRight,
  Clock,
} from "lucide-react";

const SERVICES = [
  {
    title: "Good Moral Certificate",
    description: "Request a certificate of good moral character for employment, scholarship, graduate school, or other purposes.",
    icon: FileCheck,
    href: "/services/gmc",
    color: "from-orange-500 to-amber-500",
    requirements: ["Valid School ID", "Certificate of Registration (COR)"],
    processingTime: "3-5 business days",
  },
  {
    title: "Uniform Exemption Request",
    description: "Apply for exemption from wearing the prescribed uniform due to medical conditions or religious reasons.",
    icon: Shirt,
    href: "/services/uer",
    color: "from-blue-500 to-cyan-500",
    requirements: ["Medical Certificate", "Supporting Documents"],
    processingTime: "5-7 business days",
  },
  {
    title: "Cross-Dressing Clearance",
    description: "Request clearance for cross-dressing for official university events, performances, or activities.",
    icon: Users,
    href: "/services/cdc",
    color: "from-purple-500 to-pink-500",
    requirements: ["Dean Endorsement", "Event Details"],
    processingTime: "3-5 business days",
  },
  {
    title: "Child Admission Clearance",
    description: "Request clearance for bringing children to the university campus for academic or official purposes.",
    icon: Baby,
    href: "/services/cac",
    color: "from-pink-500 to-rose-500",
    requirements: ["Child's Birth Certificate", "Valid IDs"],
    processingTime: "3-5 business days",
  },
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Our Services</h1>
            <p className="text-lg text-muted-foreground">
              Choose the service you need and submit your request online. 
              Track your application status anytime, anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Office Hours Banner */}
      <section className="bg-orange-500 dark:bg-orange-600 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              Office Hours: Monday - Friday, 8:00 AM - 5:00 PM. 
              You may submit requests anytime online.
            </span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.href} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {service.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Requirements:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {service.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{service.processingTime}</span>
                        </div>
                        <Button asChild>
                          <Link href={service.href} className="gap-2">
                            Apply Now
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">How to Request</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Fill Out Form</h3>
                <p className="text-sm text-muted-foreground">
                  Complete the online application form with accurate information.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Upload Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Attach the required documents in PDF, JPG, or PNG format.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Track Status</h3>
                <p className="text-sm text-muted-foreground">
                  Use your control number to track your request status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
