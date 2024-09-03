export const data = {
  id: 123456789,
  number: 5,
  date: "2024-03-01",
  price_printed: 5.5,
  price_digital: 3,
  thumbnail: {
    name: "thumbnail.jpg",
    content_type: "image/jpg",
    size: 150000,
    mtime: "2024-02-05T12:35:28",
    file_url: "https://file.url.com",
  },
  preview: {
    name: "preview-issue-05.pdf",
    content_type: "application/pdf",
    size: 30000000,
    mtime: "2024-02-05T12:35:28",
    file_url: "https://file.url.com",
  },
  file: {
    name: "issue-05.pdf",
    content_type: "application/pdf",
    size: 250000000,
    mtime: "2024-02-05T12:35:28",
    file_url: "https://file.url.com",
  },
  indexes: [
    {
      entry_title: "Sommaire",
      page_number: 1,
    },
    {
      entry_title: "Section 1",
      page_number: 3,
    },
    {
      entry_title: "Section 2",
      page_number: 10,
    },
  ],
  pages_data: [
    {
      page_number: 1,
      metadata: [
        {
          type: "text",
          data: {
            icon: "info",
            title: "Title",
            content: "<p>Lorem Ipsum</p>",
          },
        },
        {
          type: "link",
          data: {
            url: "http://foo.bar.com/page/1",
          },
        },
        {
          type: "file",
          data: {
            name: "my-file.zip",
            content_type: "application/zip",
            size: 40000000,
            mtime: "2024-02-05T12:35:28",
            file_url: "https://file.url.com",
          },
        },
      ],
    },
    {
      page_number: 2,
      metadata: [
        {
          type: "text",
          data: {
            icon: "warning",
            title: "Attention",
            content: "<p>This is a warning message.</p>",
          },
        },
        {
          type: "link",
          data: {
            url: "http://foo.bar.com/page/2",
          },
        },
        {
          type: "image",
          data: {
            name: "image-2.jpg",
            content_type: "image/jpg",
            size: 500000,
            mtime: "2024-02-05T12:35:28",
            file_url: "https://example.com/image-2.jpg",
          },
        },
      ],
    },
  ],
};
