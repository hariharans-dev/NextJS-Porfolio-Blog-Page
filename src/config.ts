const buildConfig = () => {
  const name = process.env.NEXT_PUBLIC_BLOG_DISPLAY_NAME || "Hariharan Blog.";
  const copyright = process.env.NEXT_PUBLIC_BLOG_COPYRIGHT || "Hariharan";
  const defaultTitle =
    process.env.NEXT_DEFAULT_METADATA_DEFAULT_TITLE ||
    "Experience with Hariharan";
  const defaultDescription =
    process.env.NEXT_PUBLIC_BLOG_DESCRIPTION ||
    "Blog about travel and lifestyle.";

  const home_name =
    process.env.NEXT_PUBLIC_HOME_DISPLAY_NAME || "Hariharan Page.";
  const home_copyright = process.env.NEXT_PUBLIC_HOME_COPYRIGHT || "Hariharan";
  const home_defaultDescription =
    process.env.NEXT_PUBLIC_HOME_DESCRIPTION || "My Portfolio.";

  return {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    blog: {
      name,
      copyright,
      metadata: {
        title: {
          absolute: defaultTitle,
          default: defaultTitle,
          template: `%s - ${defaultTitle}`,
        },
        description: defaultDescription,
      },
    },
    home: {
      name: home_name,
      copyright: home_copyright,
      metadata: {
        title: {
          absolute: defaultTitle,
          default: defaultTitle,
          template: `%s - ${defaultTitle}`,
        },
        description: home_defaultDescription,
      },
    },
    admin: {
      name: "Hariharan Admin",
      copyright: home_copyright,
      metadata: {
        title: {
          absolute: defaultTitle,
          default: defaultTitle,
          template: `%s - ${defaultTitle}`,
        },
        description: home_defaultDescription,
      },
    },
    ogImageSecret:
      process.env.OG_IMAGE_SECRET ||
      "secret_used_for_signing_and_verifying_the_og_image_url",
  };
};

export const config = buildConfig();
