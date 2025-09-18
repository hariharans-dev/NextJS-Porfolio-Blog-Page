import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { config } from "@/config";
import { signOgImageUrl } from "@/lib/og-image";
import Markdown from "react-markdown";

const content = `
# 👋 About This Blog

Hi, I'm **admin**, and welcome to my personal tech blog!  

This blog is a space where I share my journey as a **Web Developer** and **AWS Architect**, documenting the projects I work on, the technologies I explore, and the lessons I learn along the way. My goal is to create a place where fellow developers, cloud enthusiasts, and learners can find inspiration, tutorials, and insights from my experiences in the tech world.

---

## 💻 What You'll Find Here

- **Full-Stack Development:**  
  I primarily work with the **MERN Stack** (MongoDB, Express, React, Node.js), building scalable and maintainable web applications. I share tutorials, project walkthroughs, and code snippets that help others understand practical development patterns.

- **Cloud & AWS:**  
  As an **AWS Certified Cloud Practitioner** and **Solutions Architect Associate**, I often explore cloud architecture, DevOps best practices, and serverless solutions. You’ll find posts about deploying apps on AWS, optimizing cloud infrastructure, and leveraging modern cloud services.

- **Projects & Experiments:**  
  I love experimenting with new frameworks, libraries, and tools. This section of the blog covers side projects, clones of popular apps, and innovative experiments aimed at sharpening my technical skills.

- **Learning & Experiences:**  
  Sharing my personal learning journey is a big part of this blog. From debugging challenges to optimizing web performance, I document experiences that I hope others can learn from and avoid common pitfalls.

---

## 📍 Quick Info About Me

- **Email:** [admin@gmail.com](mailto:admin@gmail.com)  
- **Location:** Vellore, India – 632009  
- **Education:** B.Tech in Information Technology, VIT Vellore (2021–2025)  
- **Skills:** React, Node.js, Express.js, MongoDB, AWS, Docker, REST APIs, Git/GitHub, Java, Python  

---

## 🌐 Connect with Me

Stay connected and follow my tech journey on:

- [LinkedIn](https://www.linkedin.com/in/admin/)  
- [GitHub](https://github.com/admin)  
- [Twitter](https://x.com/admin)  
- [Instagram](https://www.instagram.com/admin/)  
- [Dev.to](https://dev.to/admin)  

I also welcome collaboration, feedback, and discussions on tech topics. Feel free to reach out anytime!

---

Thank you for visiting, and I hope my experiences inspire your own journey in tech!
`;

export async function generateMetadata() {
  return {
    title: "About Me",
    description: "Learn about admin's tech life, projects, and experiences",
    openGraph: {
      title: "About Me",
      description:
        "Insights into admin's work as a web developer and cloud architect, along with his projects and experiences",
      images: [
        signOgImageUrl({
          title: "admin",
          label: "About This Blog",
          brand: config.blog.name,
        }),
      ],
    },
  };
}

const AboutPage = async () => {
  return (
    <div className="container mx-auto px-5">
      <div className="prose lg:prose-lg dark:prose-invert m-auto mt-20 mb-10 blog-content">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
};

export default AboutPage;
