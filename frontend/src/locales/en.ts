export const en = {
  header: {
    home: "Home", searchRoom: "Find a Room", myBookings: "My Bookings",
    manage: "Manage", dashboard: "Dashboard", manageBookings: "Manage Bookings",
    roomTypes: "Room Types", rooms: "Rooms", pricingRules: "Seasonal Pricing",
    reviews: "Reviews", calendar: "Calendar", reports: "Reports",
    users: "Manage Users", profile: "Profile", logout: "Logout",
    login: "Login", register: "Register",
    managementSystem: "Management System"
  },
  hero: {
    badge: "🎉 124.8K+ Happy Customers",
    title1: "Vacation in amazing Resorts,",
    title2: "Stay in luxury Hotels.",
    subtitle: "Quickly search and book — over 1,000 options to suit every need."
  },
  featured: {
    badge: "Discover", title: "Comfort in Every Detail",
    subtitle: "Carefully curated selections.", viewAll: "View all →", all: "All",
    noRooms: "No rooms available right now.", retry: "Retry", error: "Error: "
  },
  search: {
    searching: "Searching for available rooms...",
    available: "{{count}} rooms available for your stay",
    noResult: "No rooms found. Try changing dates or filters.",
    filterTitle: "Filters", priceRange: "Price Range", amenities: "Amenities",
    minRating: "Min Rating"
  },
  amenities: {
    wifi: "Wi-Fi", pool: "Swimming Pool", breakfast: "Breakfast",
    gym: "Gym", tv: "TV", ac: "Air Conditioning", coffee: "Coffee"
  },
  roomDetail: {
    backBtn: "Back", loading: "Loading room info...", notFound: "Room not found",
    roomType: "Room Type", capacity: "Max capacity: {{count}} guests",
    policy: "Policy", amenities: "Amenities",
    reviews: "Guest Reviews", loadingReviews: "Loading reviews...",
    noReviews: "No reviews yet for this room.",
    noReviewsHint: "Be the first to share your experience!",
    basePrice: "Base Price", perNight: "/ night (before seasonal pricing)",
    actualPrice: "Actual price depends on stay dates and pricing rules.",
    contact: "Contact", backToSearch: "Back to search", ratings: "({{count}} reviews)",
    roomnumber: "Room "
  },
  myBookings: {
    title: "My Bookings", loading: "Loading...",
    tabCart: "Cart ({{count}})",
    tabHistory: "Booking history",
    status: "Status: {{status}} · Payment: {{payment}}",
    total: "Total:", unpaid: "Unpaid", pay: "Pay", cancel: "Cancel",
    cancelSuccess: "Booking cancelled", noBookings: "You have no bookings yet. Book a room on the Rooms page.",
    deselect: "Deselect", paySelected: "Pay {{count}} rooms via VNPay",
    paying: "Redirecting to VNPay..."
  },
  login: {
    title: "Login", subtitle: "Access to book rooms and manage your bookings.",
    email: "Email", password: "Password", forgotPassword: "Forgot password?",
    submit: "Login", submitting: "Logging in..."
  },
  register: {
    title: "Create Account", subtitle: "Register to book rooms and track your bookings.",
    fullName: "Full Name", email: "Email", password: "Password",
    passwordHint: "At least 6 characters", submit: "Register", submitting: "Registering..."
  },
  forgotPassword: {
    title: "Forgot Password", subtitle: "Enter your email to receive a reset link.",
    email: "Email", submit: "Send Reset Link", submitting: "Sending...",
    success: "Reset link sent! Check your email.",
    mockInstruction: "Enter your email.",
    mockTokenLabel: "Reset token:",
    goToReset: "Go to reset password page",
    backToLogin: "Back to login",
    placeholder: "Enter your email"
  },
  resetPassword: {
    title: "Reset Password", newPassword: "New Password",
    submit: "Update Password", submitting: "Updating...", success: "Password updated! Redirecting..."
  },
  profile: {
    title: "Profile", fullName: "Full Name", email: "Email",
    changePassword: "Change Password", currentPassword: "Current Password",
    newPassword: "New Password", save: "Save", saving: "Saving...",
    updateSuccess: "Profile updated!", passwordSuccess: "Password changed!", phone: "Phone Number",
    address: "Address",
    saveChanges: "Save Changes",
    confirmNewPassword: "Confirm New Password",
    validation: {
      nameRequired: "Full name is required",
      currentPasswordRequired: "Please enter current password",
      newPasswordRequired: "Please enter new password",
      passwordMinLength: "Password must be at least 6 characters",
      confirmPasswordRequired: "Please confirm new password",
      passwordMismatch: "Passwords do not match"
    },
  },
  bookingDetail: {
    title: "Booking Details", back: "Back", loading: "Loading...",
    room: "Room", checkIn: "Check-in", checkOut: "Check-out",
    guests: "Guests", status: "Status", payment: "Payment",
    total: "Total", cancel: "Cancel Booking", cancelConfirm: "Are you sure you want to cancel?",
    cancelled: "Booking cancelled", pay: "Pay Now",
    alerts: {
      reviewSuccess: "Thank you for your review!",
      invoiceError: "Could not download invoice"
    },
    loadingInfo: "Loading booking information...",
    error: {
      title: "Booking not found",
      message: "An error occurred while loading data.",
      backToList: "Back to list"
    },
    noImage: "No image available",
    nightsCount: "{{count}} nights",
    guestsCount: "{{count}} guests",
    priceDetail: "Price Details",
    totalVat: "Total Amount (VAT included)",
    qr: {
      title: "Check-in Code",
      instruction: "Please present this code to the receptionist when checking in."
    },
    actions: {
      downloadInvoice: "Download Invoice (PDF)",
      reviewRoom: "Review this room",
      reviewed: "You have reviewed this room"
    },
    support: {
      title: "Need help?",
      desc: "If you need to make changes or have special requests for this booking, please contact customer support.",
      hotline: "Hotline:"
    },
    reviewModal: {
      title: "Review Your Stay",
      subtitle: "Your experience will help other customers!",
      roomQuality: "Room Quality",
      commentLabel: "Comment",
      commentPlaceholder: "Share your thoughts on the room, services, amenities...",
      publicNotice: "This review will be displayed publicly on the room detail page.",
      submit: "Submit Review",
      submitting: "Submitting..."
    }
  },
  apiErrors: {
    ROOM_NOT_AVAILABLE: "This room is currently not available for booking.",
    ROOM_OCCUPIED: "The room is already booked for the selected dates.",
    GUESTS_EXCEED_CAPACITY: "The number of guests exceeds the room's maximum capacity.",
    INVALID_DATES: "Check-out date must be after the check-in date.",
    ROOM_NOT_FOUND: "Room not found.",
    BOOKING_NOT_FOUND: "Booking not found.",
    ACCESS_DENIED: "You do not have permission to perform this action.",
    INVALID_STATUS_FOR_CANCEL: "Only pending or paid bookings can be cancelled.",
    INVALID_STATUS_FOR_CHECKIN: "Only paid bookings can be checked in.",
    INVALID_STATUS_FOR_CHECKOUT: "Only checked-in bookings can be checked out.",
    VALIDATION_ERROR: "Please check the information provided.",
    ROOM_NUMBER_EXISTS: "This room number is already in use.",
    ROOM_TYPE_EXISTS: "This room type name already exists.",
    EMAIL_EXISTS: "This email address is already registered.",
    INVALID_CREDENTIALS: "The email or password you entered is incorrect.",
    INVALID_OR_EXPIRED_TOKEN: "The password reset link is invalid or has expired.",
    INCORRECT_PASSWORD: "The current password you entered is incorrect.",
    INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again later.",
    UNKNOWN_ERROR: "Something went wrong."
  },
  payments: {
    historyTitle: "Booking History",
    historySubtitle: "All your past and upcoming bookings.",
    filterAll: "All",
    filterPaid: "Paid",
    filterCompleted: "Completed",
    filterCancelled: "Cancelled",
    success: "Payment Successful!", successMsg: "Your booking has been confirmed.",
    cancel: "Payment Cancelled", cancelMsg: "Your payment was cancelled. Your booking is still pending.",
    backToBookings: "Back to My Bookings",
    history: "Payment History", noPayments: "No payment history.",
    loading: "Loading payment history...",
    status: {
      SUCCESS: "Success",
      FAILED: "Failed",
      PENDING: "Processing",
      REFUNDED: "Refunded"
    },
    filter: {
      statusLabel: "Status",
      all: "All statuses",
      startDate: "From date",
      endDate: "To date"
    },
    table: {
      transactionId: "Transaction ID",
      product: "Product / Duration",
      amount: "Amount",
      status: "Status",
      date: "Transaction Date",
      room: "Room {{number}}"
    },
    empty: {
      title: "No transactions found",
      subtitle: "Try adjusting the filters to find different results."
    }
  },
  propertyCard: {
    perNight: "/night",
    totalPrice: "total",
    featured: "Featured",
    bookNow: "Book Now",
    roomnumber: "Room"
  },
  bookingSearch: {
    checkInLabel: "Check-in",
    checkOutLabel: "Check-out",
    selectDate: "Select date",
    guestsLabel: "Guests",
    guestsCount: "{{count}} guest(s)",
    done: "Done",
    searching: "Searching...",
    searchButton: "Search"
  },
  filterSidebar: {
    title: "Search Filters",
    priceRange: "Price Range",
    priceLabel: "Price limit",
    amenities: "Amenities",
    rating: "Guest Rating",
    stars: "{{count}}+ Stars"
  },
  footer: {
    copyright: "© 2026 Hotel Booking System",
    description: "A professional and modern hotel booking management solution.",
    faq: "FAQ",
    policy: "Policies & Terms",
    version: "Version {{current}}"
  },
  notifications: {
    title: "Notifications",
    subtitle: "Stay updated with the latest activities related to your stay.",
    systemLabel: "Notification System",
    markAllRead: "Mark all as read",
    unread: "Unread",
    syncing: "Syncing...",
    viewDetails: "View details",
    markAsRead: "Mark as read",
    empty: "No notifications",
    emptyDesc: "You currently have no notifications in this category.",
    newCount: "{{count}} New",
    viewAll: "View all",
  },
  roomGallery: {
    imageAlt: "Room {{roomNumber}}",
    noImage: "No images available",
    thumbnailAlt: "Thumbnail image"
  },
  faq: {
    title: "Frequently Asked Questions",
  },
  policy: {
    title: "Privacy Policy",
    badge: "Policy",
    pageTitle: "Policies & Regulations",
    subtitle: "Terms and conditions to protect customer rights and ensure the best service quality.",
    booking: {
      title: "Booking Policy",
      point1: "All booking requests will be instantly confirmed by the system upon room availability and successful payment.",
      point2_part1: "The system will hold your room for a maximum of",
      point2_highlight: "30 minutes",
      point2_part2: "from the time of booking. If payment is not made within this timeframe, the booking will be automatically canceled.",
      point3: "Booking confirmation details will be sent to your email immediately after a successful transaction."
    },
    cancellation: {
      title: "Cancellation Policy",
      before24h_label: "Cancellation before 24 hours:",
      before24h_text: "You will receive a 100% refund via the VNPay gateway. Processing time is 3-5 business days depending on the banking system.",
      within24h_label: "Cancellation within 24 hours:",
      within24h_text: "We regret that we cannot issue refunds for urgent cancellations after the aforementioned period.",
      noShow_label: "No-show:",
      noShow_text: "If you fail to arrive without prior cancellation notice, a penalty equivalent to the first night's room rate or the entire booking value will be applied depending on specific regulations."
    },
    checkInOut: {
      title: "Check-in / Check-out Policy",
      checkInLabel: "Check-in Time",
      checkInTime: "From 14:00",
      checkOutLabel: "Check-out Time",
      checkOutTime: "Before 12:00",
      note_part1: "Early check-in or late check-out outside the standard timeframes will incur an additional surcharge of",
      note_highlight: "50% of 1 night's rate",
      note_part2: "(subject to room availability at that time)."
    },
    privacy: {
      intro: "At Hotel Booking, we are absolutely committed to the security of customer data:",
      point1: "All personal information and payment accounts are encrypted using the highest SSL security standards.",
      point2: "We commit not to share or provide your information to any third party unless required by competent authorities.",
      point3: "You have full rights to manage, modify, or request the deletion of your personal information directly in the Profile section."
    }
  },
  statusBadge: {
    Paid: "Paid",
    Pending: "Pending",
    Expired: "Expired",
    Cancelled: "Cancelled",
    CheckedIn: "Checked In",
    CheckedOut: "Checked Out"
  },
  notFound: {
    title: "Page Not Found", back: "Back to Home"
  },
  admin: {
    roomTypes: {
      eyebrow: "System Configuration",
      title: "Room Types",
      subtitle: "Manage room categories, base prices, and default capacity of the hotel.",
      messages: {
        updateSuccess: "Room type updated successfully.",
        addSuccess: "New room type added.",
        confirmDelete: "Are you sure you want to delete this room type?",
        deleteSuccess: "Room type deleted."
      },
      form: {
        addTitle: "Add New Room Type",
        updateTitle: "Update Room Type",
        nameLabel: "Room Type Name",
        namePlaceholder: "E.g., Deluxe Ocean View",
        priceLabel: "Base Price / Night",
        capacityLabel: "Max Capacity",
        descriptionLabel: "Detailed Description",
        descriptionPlaceholder: "Brief description of the features of this room type...",
        addButton: "Create Room Type",
        updateButton: "Save Changes",
        cancelButton: "Cancel"
      },
      list: {
        title: "Existing List",
        edit: "Edit",
        delete: "Delete",
        priceFormat: "{{price}} USD / night",
        maxGuests: "Up to {{count}} guests",
        empty: "No room type data found."
      }
    },
    rooms: {
      eyebrow: "Asset Management",
      title: "Room List",
      subtitle: "Register new rooms, update status, and assign corresponding room types.",
      roomNumber: "Room Number",
      roomType: "Room Type",
      capacity: "Capacity",
      selectAmenities: "Select Amenities",
      isActive: "Operating Status",
      policies: "Policies & Terms",
      images: "Actual Images",
      update: "Save Changes",
      create: "Create Room",
      cancel: "Cancel",
      searchPlaceholder: "Search room...",
      filterAll: "All room types",
      noData: "No room data found.",
      messages: {
        updateSuccess: "Room updated successfully.",
        addSuccess: "New room created.",
        confirmDelete: "Are you sure you want to delete this room? Related bookings may be affected.",
        deleteSuccess: "Room deleted successfully."
      },
      form: {
        addTitle: "Register New Room",
        updateTitle: "Update Room Info",
        roomNumberPlaceholder: "E.g. 301, Penthouse-1",
        statusActive: "Ready for guests",
        statusInactive: "Maintenance / Locked",
        policiesPlaceholder: "E.g. No smoking,...",
        existingImages: "Existing images ({{count}})",
        clickToRemove: "click ✕ to remove",
        willBeDeleted: "Will be deleted",
        deleteWarning: "{{count}} images will be permanently removed after saving.",
        addNewImages: "Add new images",
        uploadImages: "Upload images",
        uploadNote: "Multiple files (Max 5MB)",
        willUpload: "Will upload {{count}} new images:"
      },
      list: {
        title: "Current Room List ({{count}})",
        roomAlt: "Room {{number}}",
        noImage: "No image",
        active: "ACTIVE",
        inactive: "INACTIVE",
        roomNumber: "Room {{number}}",
        maxCapacity: "Max {{count}} guests",
        editTitle: "Edit room",
        deleteTitle: "Delete room",
        viewClient: "View as client"
      }
    },
    bookings: {
      eyebrow: "Management System",
      title: "Booking Management",
      subtitle: "Track rooms, customer info, approve Check-in/Check-out and Cancel bookings.",
      priceFormat: "{{price}} VND",
      anonymousGuest: "Anonymous Guest",
      roomNumber: "Room {{number}}",
      emptyList: "No bookings found in the list.",
      status: {
        paid: "Paid",
        refunded: "Refunded"
      },
      actions: {
        cancel: "Cancel Room",
        checkIn: "Check-in",
        checkOut: "Check-out"
      },
      messages: {
        checkInSuccess: "Check-in completed.",
        checkOutSuccess: "Check-out completed.",
        confirmCancel: "Are you sure you want to cancel this booking? If the guest has paid, the system will automatically process a refund.",
        cancelSuccess: "Booking cancelled and refund processed successfully."
      }
    },
    users: {
      eyebrow: "Staff Management",
      title: "User Accounts",
      subtitle: "System permissions, activity status management, and basic user information.",
      searchPlaceholder: "Search by name or email address...",
      sortLabel: "Sort:",
      sortDefault: "Default (Newest)",
      selfTag: "ME",
      atTime: "At {{time}}",
      roles: {
        admin: "Administrator",
        staff: "Staff",
        user: "Customer",
        adminCaps: "ADMIN",
        staffCaps: "STAFF",
        userCaps: "USER"
      },
      status: {
        active: "Active",
        inactive: "Deactivated"
      },
      table: {
        member: "Member",
        role: "Permissions",
        status: "Status",
        info: "Registration Info",
        action: "Approval"
      },
      actions: {
        activate: "Activate account",
        deactivate: "Deactivate account"
      },
      empty: {
        title: "No Data Found",
        desc: "No users found matching keywords \"{{search}}\"."
      },
      pagination: {
        info: "Showing page {{current}} of {{total}} — Total {{members}} members"
      }
    },
    reviews: {
      title: "Reviews Management", approve: "Approve", reject: "Reject",
      noData: "No reviews.",
      eyebrow: "Content Moderation",
      pageTitle: "Reviews & Feedback",
      subtitle: "Review customer experiences and manage the visibility of reviews on the homepage.",
      totalFeedback: "Total: {{count}} feedback(s)",
      roomName: "Room {{number}}",
      noComment: "No comment provided.",
      emptyTitle: "Empty List",
      table: {
        customer: "Customer",
        product: "Product",
        rating: "Rating",
        content: "Content",
        moderation: "Moderation",
        visibility: "Visibility"
      },
      status: {
        public: "Public",
        hidden: "Hidden"
      },
      action: {
        hide: "Hide Review",
        show: "Make Public"
      }
    },
    pricingRules: {
      eyebrow: "Business Strategy",
      pageTitle: "Pricing Rules",
      subtitle: "Set up flexible pricing structures for seasons, weekends, or special holidays.",
      noData: "No pricing rules have been configured yet.",
      msg: {
        dateError: "Start date must be before end date.",
        createSuccess: "New pricing rule created successfully.",
        confirmDelete: "Are you sure you want to delete this rule?",
        deleteSuccess: "Rule deleted."
      },
      form: {
        title: "Create New Pricing Rule",
        roomType: "Apply to Room Type",
        ruleName: "Campaign / Rule Name",
        ruleNamePlaceholder: "E.g. Summer Peak Surcharge",
        priceType: "Pricing Method",
        typePercentage: "Percentage Increase (%)",
        typeFixed: "Fixed Addition ($)",
        startDate: "Start Date",
        endDate: "End Date",
        value: "Additional Value",
        applyWeekend: "Apply to Weekends Only (Sat, Sun)",
        applyHolidays: "Apply to Holidays Only",
        submit: "Save Rule"
      },
      list: {
        title: "Active Rules",
        removeAction: "Delete",
        duration: "Validity Period",
        priceChange: "Price Change",
        tagWeekend: "Weekend",
        tagHoliday: "Holiday"
      }
    },
    reports: {
      eyebrow: "Analytics & Statistics",
      pageTitle: "Revenue & Performance Reports",
      subtitle: "View reports on occupancy rates, popular room types, and business performance over a specific period.",
      filter: {
        title: "Filter Reports",
        startDate: "Start Date",
        endDate: "End Date",
        submit: "Apply Filter"
      },
      occupancy: {
        title: "Room Occupancy Rate",
        subtitle: "Measures the performance of rooms booked during the period",
        bookedRooms: "{{count}} booked rooms",
        totalRooms: "{{count}} total rooms",
        noData: "No data available for this period.",
        trend: "Trend:",
        stable: "Stable",
        overThreshold: "High performance (>70%)"
      },
      popularRooms: {
        title: "Popular Room Types",
        subtitle: "Top most booked room types during the selected period",
        noData: "No popular room data available.",
        idLabel: "ID:",
        bookingsCount: "{{count}} bookings",
        hot: "HOT",
        suggestionLabel: "Quick Analysis:",
        suggestionText: "The \"{{roomName}}\" room type has the highest number of bookings. Consider optimizing pricing or expanding the number of rooms for this category.",
        mostPopularFallback: "this room type"
      }
    },
    calendar: {
      eyebrow: "Operations Management",
      title: "Booking Calendar",
      subtitle: "Monitor room availability and visually manage check-in/check-out schedules.",
      view: {
        month: "Month",
        week: "Week",
        day: "Day"
      },
      messages: {
        next: "Next",
        previous: "Back",
        today: "Today",
        month: "Month",
        week: "Week",
        day: "Day",
        agenda: "Agenda"
      },
      modal: {
        title: "Booking Details",
        roomPrefix: "ROOM",
        time: "Time",
        status: "Status",
        manageBooking: "Manage Booking"
      },
      legend: {
        note: "Note:"
      },
      status: {
        Paid: "Paid",
        Pending: "Pending",
        Cancelled: "Cancelled",
        CheckedIn: "Checked In",
        CheckedOut: "Checked Out"
      }
    },
    dashboard: {
      eyebrow: "System Overview",
      pageTitle: "Admin Dashboard",
      subtitle: "Track business performance, manage booking requests, and view real-time revenue reports.",
      viewCalendar: "View Calendar",
      error: {
        loadFailed: "Unable to load statistics.",
        generic: "An error occurred."
      },
      kpi: {
        todayBookings: {
          title: "Today's Bookings",
          desc: "New reservations"
        },
        todayRevenue: {
          title: "Today's Revenue",
          desc: "Actual received revenue"
        },
        occupancy: {
          title: "Occupancy Rate",
          desc: "Room utilization rate"
        },
        pending: {
          title: "Pending Approval",
          desc: "Bookings pending confirmation"
        }
      },
      chart: {
        title: "Revenue (Last 7 Days)",
        unit: "Currency: VND",
        totalRevenue: "Total Revenue",
        tooltipLabel: "Revenue"
      },
      analysis: {
        title: "Quick Analysis",
        adviceLabel: "Admin Advice",
        adviceContent: "\"There are 12 check-outs today. Please prepare the end-of-day revenue reports before 17:00.\""
      },
      recentBookings: {
        title: "Recent Bookings",
        viewAll: "View All",
        roomPrefix: "Room {{number}}",
        detail: "Details",
        table: {
          customer: "Customer",
          room: "Room No.",
          status: "Status",
          action: "Action"
        }
      }
    }
  },
  common: {
    save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete",
    success: "Success", error: "Error", loading: "Loading...",
    confirm: "Confirm", back: "Back", close: "Close", search: "Search",
    filter: "Filter", all: "All", active: "Active", inactive: "Inactive",
    yes: "Yes", no: "No", noData: "No data", retry: "Retry",
    pagination: {
      showing: "Showing page {{page}} of {{totalPages}}",
      totalReviews: "{{count}} total reviews"
    }
  },
  uniqueSection: {
    eyebrow: "Why Choose Us",
    title: "What Sets Us Apart",
    points: {
      quality: {
        title: "Top Quality & Comfort",
        desc: "Carefully selected rooms with a 4.8★ average rating.",
        badge: "4.8★ Avg Rating"
      },
      price: {
        title: "Best Price Guarantee",
        desc: "We ensure the most competitive prices for every choice."
      },
      secure: {
        title: "Secure Payments",
        desc: "SSL encrypted transactions, protected via VNPay."
      },
      refund: {
        title: "Easy Refunds",
        desc: "Cancel 24h in advance → 100% refund, no questions asked."
      }
    },
    stats: {
      rooms: "Available Rooms",
      bookings: "Total Bookings",
      rating: "Average Rating",
      satisfaction: "Satisfied Customers"
    }
  },
  testimonials: {
    eyebrow: "What Our Customers Say",
    title: "Real Experiences from Our Guests",
    list: [
      {
        quote: "I booked a room through here and had a truly wonderful experience! Fast process, clean room, and very friendly staff.",
        author: "Nguyen Minh Tuan",
        location: "Hanoi"
      },
      {
        quote: "Reasonable price, the room was better than expected. Will definitely use this service for future trips.",
        author: "Tran Thi Lan",
        location: "Ho Chi Minh City"
      },
      {
        quote: "Intuitive and easy-to-use booking system. I love the feature that allows viewing calendars and daily prices.",
        author: "Pham Quoc Hung",
        location: "Da Nang"
      }
    ]
  },
  awardSection: {
    eyebrow: "International Awards",
    title: "Globally recognized for outstanding hotel services.",
    subtitle: "We don't just provide accommodation — we create memorable stays.",
    stats: {
      years: "Years of Experience",
      awards: "Awards"
    },
    card: {
      specs: " guests · bedrooms · bathrooms",
      price: "200$/night",
      bookNow: "Book Now"
    }
  },
  roomPriceCard: {
    title: "Price Information",
    basePriceLabel: "Base price (by room type):",
    contact: "Contact us",
    backToSearch: "Back to search"
  },
  cart: {
    title: "Cart",
    empty: "Your cart is empty.",
    emptyHint: "Browse rooms to add.",
    paySelected: "Pay {{count}} room(s)",
    payAll: "Pay all in cart",
    selectAll: "Select all",
    autoCancel: "Auto-cancels in {{min}} min",
    removeItem: "Remove",
    continueShopping: "Add more rooms",
  },
  bookingForm: {
    title: "Book a Room",
    addedToCart: "✓ Added to cart! Continue browsing.",
    addToCart: "Add to Cart",
    checkIn: "Check-in Date",
    checkOut: "Check-out Date",
    selectDate: "Select date",
    guests: "Guests",
    guestsCount: "{{count}} guests (max {{max}})",
    guestLabel: "Guest",
    done: "Done",
    calculating: "Calculating...",
    quotePrice: "Get Quote",
    summary: "{{nights}} nights · ${{price}}/night",
    processing: "Processing...",
    addRoom: "Add Room",
    bookAndPay: "Book & Pay",
    hint: "Hint: click \"Get Quote\" to see the total amount before booking.",
    specialRequest: "Special requests (optional) — add in the next step"
  },
};
