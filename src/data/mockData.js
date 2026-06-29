const mockUsers = [
  {
    _id: "admin-1",
    name: "Admin User",
    email: "admin@tapitude.test",
    role: "admin",
    status: "active"
  },
  {
    _id: "creator-1",
    name: "Demo Creator",
    email: "creator@tapitude.test",
    role: "creator",
    status: "active"
  }
];

const mockCreators = [
  {
    _id: "creator-1",
    name: "Demo Creator",
    email: "creator@tapitude.test",
    role: "creator",
    status: "active",
    createdAt: new Date()
  },
  {
    _id: "creator-2",
    name: "Glassmorphism Studio",
    email: "studio@tapitude.test",
    role: "creator",
    status: "active",
    createdAt: new Date()
  }
];

const mockContentPages = [
  {
    _id: "content-1",
    creatorId: "creator-1",
    title: "The Future of NFC in 2026",
    slug: "summer-drop-2026",
    body: "A simple Tapitude public page example that shows how NFC can connect people to digital content.",
    buttonText: "Learn More",
    externalLink: "https://example.com",
    embedUrl: "https://youtube.com/example",
    embedType: "youtube",
    status: "published",
    publishDate: new Date()
  },
  {
    _id: "content-2",
    creatorId: "creator-1",
    title: "Glassmorphism Design Guide",
    slug: "glassmorphism-design-guide",
    body: "A short guide for creating clean digital experiences.",
    buttonText: "Open Guide",
    externalLink: "https://example.com/guide",
    embedUrl: "",
    embedType: "none",
    status: "published",
    publishDate: new Date(Date.now() + 1000 * 60 * 60 * 24)
  }
];

const mockProfile = {
  _id: "profile-1",
  userId: "creator-1",
  displayName: "Demo Creator",
  brandName: "CreatorHub",
  bio: "Creating simple digital experiences through Tapitude."
};

function findMockUserByEmail(email) {
  return mockUsers.find((user) => user.email === email?.toLowerCase().trim());
}

function findMockUserById(id) {
  return mockUsers.find((user) => user._id === id);
}

function addMockCreator({ name, email, brandName }) {
  const newCreator = {
    _id: `creator-${Date.now()}`,
    name,
    email,
    brandName,
    role: "creator",
    status: "active",
    createdAt: new Date()
  };

  mockCreators.unshift(newCreator);
  return newCreator;
}

function addMockContentPage(page) {
  const newPage = {
    _id: `content-${Date.now()}`,
    ...page
  };

  mockContentPages.unshift(newPage);
  return newPage;
}

function updateMockContentPage(id, updates) {
  const page = mockContentPages.find((item) => item._id === id);

  if (!page) {
    return null;
  }

  Object.assign(page, updates);
  return page;
}

function deleteMockContentPage(id) {
  const index = mockContentPages.findIndex((item) => item._id === id);

  if (index >= 0) {
    mockContentPages.splice(index, 1);
  }
}

module.exports = {
  mockUsers,
  mockCreators,
  mockContentPages,
  mockProfile,
  findMockUserByEmail,
  findMockUserById,
  addMockCreator,
  addMockContentPage,
  updateMockContentPage,
  deleteMockContentPage
};
