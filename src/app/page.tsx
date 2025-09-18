import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Mail,
  ExternalLink,
} from "lucide-react";

const skills = [
  {
    name: "ReactJS",
    icon: "https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/000000/external-react-a-javascript-library-for-building-user-interfaces-logo-color-tal-revivo.png",
  },
  {
    name: "ExpressJS",
    icon: "https://img.icons8.com/fluency/48/000000/node-js.png",
  },
  { name: "NodeJS", icon: "https://img.icons8.com/color/48/000000/nodejs.png" },
  {
    name: "Bootstrap",
    icon: "https://img.icons8.com/color/48/000000/bootstrap.png",
  },
  {
    name: "HTML5",
    icon: "https://img.icons8.com/color/48/000000/html-5--v1.png",
  },
  { name: "CSS3", icon: "https://img.icons8.com/color/48/000000/css3.png" },
  {
    name: "JavaScript",
    icon: "https://img.icons8.com/color/48/000000/javascript--v1.png",
  },
  {
    name: "Java",
    icon: "https://img.icons8.com/color/48/000000/java-coffee-cup-logo--v1.png",
  },
  { name: "Kotlin", icon: "https://img.icons8.com/color/48/000000/kotlin.png" },
  {
    name: "Python",
    icon: "https://img.icons8.com/color/48/000000/python--v1.png",
  },
  {
    name: "C++",
    icon: "https://img.icons8.com/color/48/000000/c-plus-plus-logo.png",
  },
  {
    name: "MongoDB",
    icon: "https://img.icons8.com/color/48/000000/mongodb.png",
  },
  {
    name: "MySQL",
    icon: "https://img.icons8.com/color/48/000000/mysql-logo.png",
  },
  {
    name: "AWS",
    icon: "https://img.icons8.com/color/48/000000/amazon-web-services.png",
  },
  {
    name: "jQuery",
    icon: "https://img.icons8.com/ios-filled/48/1169ae/jquery.png",
  },
  { name: "Git VCS", icon: "https://img.icons8.com/color/48/000000/git.png" },
  {
    name: "GitHub",
    icon: "https://img.icons8.com/glyph-neue/48/ffffff/github.png",
  },
  {
    name: "WordPress",
    icon: "https://img.icons8.com/color/48/000000/wordpress.png",
  },
];

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-5">
      <section className="text-center mt-16 mb-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Hi, I&apos;m <span className="text-blue-600">Hariharan S</span>
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mt-4">
          Web Developer • AWS Architect • Cloud Enthusiast
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <Button asChild>
            <a href="#about">About Me</a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://drive.google.com/file/d/1-v9qtPmXzoAsPNHzu1GoQySQlUOfl4Ub/view?usp=sharing"
              target="_blank"
            >
              View Resume <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="grid md:grid-cols-2 gap-10 items-center mb-20"
      >
        <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-lg bg-black">
          <Image
            src="/images/home/myImage.png"
            alt="Hariharan"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4">About Me</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore,
            soluta neque. Soluta tenetur eius incidunt quam ea pariatur velit
            optio explicabo asperiores tempore officiis doloremque eum,
            voluptate omnis ut non.
          </p>

          <div className="mt-4 text-gray-700 dark:text-gray-300">
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:admim.developer@gmail.com"
                className="text-blue-600"
              >
                admin@gmail.com
              </a>
            </p>
            <p>
              <strong>Location:</strong> World
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 mt-6">
            <a href="https://www.linkedin.com/admin" target="_blank">
              <Linkedin className="w-6 h-6 hover:text-blue-600" />
            </a>
            <a href="https://github.com/admin" target="_blank">
              <Github className="w-6 h-6 hover:text-gray-800 dark:hover:text-gray-200" />
            </a>
            <a href="https://x.com/admin" target="_blank">
              <Twitter className="w-6 h-6 hover:text-sky-500" />
            </a>
            <a href="https://www.instagram.com/admin" target="_blank">
              <Instagram className="w-6 h-6 hover:text-pink-500" />
            </a>
            <a href="mailto:admin@gmail.com">
              <Mail className="w-6 h-6 hover:text-red-500" />
            </a>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Skills & Abilities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {skills.map((skill, index) => (
            <Card
              key={index}
              className="flex flex-col items-center justify-center p-4 hover:shadow-xl transition"
            >
              <Image
                src={skill.icon}
                alt={skill.name}
                width={48}
                height={48}
                className="rounded"
              />
              <p className="mt-2 text-sm font-medium text-center">
                {skill.name}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Education</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <Image
              src="/images/home/college.jpeg"
              alt="school"
              width={600}
              height={300}
              className="object-cover w-full h-48"
            />
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold">Higher education</h3>
              <p>University</p>
              <p className="text-gray-500">2121 - 2125 | Completed</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <Image
              src="/images/home/school.jpeg"
              alt="School"
              width={600}
              height={300}
              className="object-cover w-full h-48"
            />
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold">
                Higher Secondary Education
              </h3>
              <p>School</p>
              <p className="text-gray-500">2119 - 2121 | International Board</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Certifications</h2>
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-xl font-semibold">
              AWS Certified Advanced Cloud Practitioner
            </h3>
            <p className="text-gray-500">2124 - 2127</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-xl font-semibold">
              AWS Solutions Advanced Architect Associate
            </h3>
            <p className="text-gray-500">2124 - 2127</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
