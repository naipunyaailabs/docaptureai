import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "docapture revolutionized how we handle invoices. Saved us 20+ hours a week and improved accuracy immensely!",
      name: "Sarah L.",
      title: "CFO, Tech Solutions Inc.",
      avatar: "/placeholder.svg?width=48&height=48",
      stars: 5,
    },
    {
      quote:
        "The accuracy of their AI for complex legal documents is unmatched. Highly recommend for any data-heavy workflow.",
      name: "John B.",
      title: "Operations Manager, Global Logistics Co.",
      avatar: "/placeholder.svg?width=48&height=48",
      stars: 5,
    },
    {
      quote:
        "Seamless API integration and fantastic support. docapture has been a game-changer for our document management.",
      name: "Emily K.",
      title: "CTO, Healthcare Innovators",
      avatar: "/placeholder.svg?width=48&height=48",
      stars: 5,
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Trusted by Businesses Like Yours</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Hear what our satisfied customers have to say about docapture.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex mb-3">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-6">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center mt-auto">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 border-2 border-cyan-500"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
