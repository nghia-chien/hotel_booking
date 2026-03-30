import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const en = {
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
    updateSuccess: "Profile updated!", passwordSuccess: "Password changed!"
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
  payments: {
    success: "Payment Successful!", successMsg: "Your booking has been confirmed.",
    cancel: "Payment Cancelled", cancelMsg: "Your payment was cancelled. Your booking is still pending.",
    backToBookings: "Back to My Bookings",
    history: "Payment History", noPayments: "No payment history.",
    historySubtitle: "Manage and track your transactions here.",
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
    bookNow: "Book Now"
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
    Confirmed: "Confirmed",
    Pending: "Pending",
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
        Confirmed: "Confirmed",
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
  bookingForm: {
    title: "Book a Room",
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

const vi = {
  header: {
    home: "Trang chủ", searchRoom: "Tìm phòng", myBookings: "Booking của tôi",
    manage: "Quản lý", dashboard: "Dashboard", manageBookings: "Quản lý booking",
    roomTypes: "Loại phòng", rooms: "Phòng", pricingRules: "Giá theo mùa",
    reviews: "Đánh giá", calendar: "Lịch phòng", reports: "Báo cáo",
    users: "Quản lý user", profile: "Hồ sơ", logout: "Đăng xuất",
    login: "Đăng nhập", register: "Đăng ký",
    managementSystem: "Hệ thống Quản lý"
  },
  hero: {
    badge: "🎉 124.8K+ Khách hàng hài lòng",
    title1: "Nghỉ dưỡng tại những Resort tuyệt vời,",
    title2: "Khách sạn sang trọng.",
    subtitle: "Đặt phòng nhanh chóng — nhiều lựa chọn phù hợp với mọi nhu cầu."
  },
  featured: {
    badge: "Khám phá", title: "Thoải mái đến từng chi tiết",
    subtitle: "Những lựa chọn được tuyển chọn kỹ lưỡng.", viewAll: "Xem tất cả →", all: "Tất cả",
    noRooms: "Hiện chưa có phòng nào.", retry: "Thử lại", error: "Lỗi: "
  },
  search: {
    searching: "Đang tìm kiếm phòng phù hợp...",
    available: "{{count}} phòng có sẵn cho kỳ nghỉ của bạn",
    noResult: "Không tìm thấy phòng phù hợp. Hãy thử thay đổi ngày hoặc bộ lọc.",
    filterTitle: "Bộ lọc", priceRange: "Khoảng giá", amenities: "Tiện nghi",
    minRating: "Đánh giá tối thiểu"
  },
  amenities: {
    wifi: "Wi-Fi", pool: "Hồ bơi", breakfast: "Bữa sáng",
    gym: "Phòng Gym", tv: "TV", ac: "Điều hòa", coffee: "Cà phê"
  },
  roomDetail: {
    backBtn: "Quay lại", loading: "Đang tải thông tin phòng...", notFound: "Không tìm thấy phòng",
    roomType: "Loại phòng", capacity: "Sức chứa tối đa: {{count}} khách",
    policy: "Chính sách", amenities: "Tiện nghi",
    reviews: "Đánh giá từ khách hàng", loadingReviews: "Đang tải đánh giá...",
    noReviews: "Chưa có đánh giá nào cho phòng này.",
    noReviewsHint: "Hãy là người đầu tiên chia sẻ trải nghiệm!",
    basePrice: "Giá cơ bản", perNight: "/ đêm (chưa tính giá theo mùa)",
    actualPrice: "Giá thực tế khi đặt phòng sẽ tính theo ngày ở và pricing rules.",
    contact: "Liên hệ", backToSearch: "Quay lại tìm phòng", ratings: "({{count}} đánh giá)",
    roomnumber: "Phòng"
  },
  myBookings: {
    title: "Booking của tôi", loading: "Đang tải...",
    status: "Trạng thái: {{status}} · Thanh toán: {{payment}}",
    total: "Tổng tiền:", unpaid: "Chưa thanh toán", pay: "Thanh toán", cancel: "Huỷ booking",
    cancelSuccess: "Đã huỷ booking", noBookings: "Bạn chưa có booking nào. Hãy đặt phòng tại trang Rooms.",
    deselect: "Bỏ chọn", paySelected: "Thanh toán {{count}} phòng qua VNPay",
    paying: "Đang chuyển VNPay..."
  },
  login: {
    title: "Đăng nhập", subtitle: "Truy cập để đặt phòng và quản lý booking của bạn.",
    email: "Email", password: "Mật khẩu", forgotPassword: "Quên mật khẩu?",
    submit: "Đăng nhập", submitting: "Đang đăng nhập..."
  },
  register: {
    title: "Tạo tài khoản", subtitle: "Đăng ký tài khoản để đặt phòng và theo dõi booking của bạn.",
    fullName: "Họ tên", email: "Email", password: "Mật khẩu",
    passwordHint: "Ít nhất 6 ký tự", submit: "Đăng ký", submitting: "Đang đăng ký..."
  },
  forgotPassword: {
    title: "Quên mật khẩu", subtitle: "Nhập email để nhận link đặt lại mật khẩu.",
    email: "Email", submit: "Gửi link đặt lại", submitting: "Đang gửi...",
    success: "Đã gửi link! Kiểm tra email của bạn.",
    mockInstruction: "Nhập email của bạn.",
    mockTokenLabel: "Reset token :",
    goToReset: "Đi tới trang đặt mật khẩu mới",
    backToLogin: "Quay lại đăng nhập"
  },
  resetPassword: {
    title: "Đặt lại mật khẩu", newPassword: "Mật khẩu mới", placeholder_token: "reset token",
    submit: "Cập nhật mật khẩu", submitting: "Đang cập nhật...", success: "Đã cập nhật mật khẩu! Đang chuyển hướng..."
  },
  profile: {
    title: "Hồ sơ cá nhân", fullName: "Họ tên", email: "Email",
    changePassword: "Đổi mật khẩu", currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới", save: "Lưu", saving: "Đang lưu...",
    updateSuccess: "Đã cập nhật hồ sơ!", passwordSuccess: "Đã đổi mật khẩu!", phone: "Số điện thoại",
    address: "Địa chỉ",
    saveChanges: "Lưu thay đổi",
    confirmNewPassword: "Xác nhận mật khẩu mới",
    validation: {
      nameRequired: "Họ tên là bắt buộc",
      currentPasswordRequired: "Vui lòng nhập mật khẩu hiện tại",
      newPasswordRequired: "Vui lòng nhập mật khẩu mới",
      passwordMinLength: "Mật khẩu phải từ 6 ký tự",
      confirmPasswordRequired: "Vui lòng xác nhận mật khẩu mới",
      passwordMismatch: "Mật khẩu xác nhận không khớp"
    },
  },

  bookingDetail: {
    title: "Chi tiết đặt phòng", back: "Quay lại", loading: "Đang tải...",
    room: "Phòng", checkIn: "Nhận phòng", checkOut: "Trả phòng",
    guests: "Số khách", status: "Trạng thái", payment: "Thanh toán",
    total: "Tổng cộng", cancel: "Huỷ đặt phòng", cancelConfirm: "Bạn có chắc muốn huỷ không?",
    cancelled: "Đã huỷ đặt phòng", pay: "Thanh toán ngay",
    alerts: {
      reviewSuccess: "Cảm ơn bạn đã đánh giá!",
      invoiceError: "Không thể tải hoá đơn"
    },
    loadingInfo: "Đang tải thông tin booking...",
    error: {
      title: "Không tìm thấy booking",
      message: "Có lỗi xảy ra khi tải dữ liệu.",
      backToList: "Quay lại danh sách"
    },
    noImage: "Phòng chưa có ảnh",
    nightsCount: "{{count}} đêm",
    guestsCount: "{{count}} khách",
    priceDetail: "Chi tiết giá",
    totalVat: "Tổng tiền (đã bao gồm VAT)",
    qr: {
      title: "Mã nhận phòng",
      instruction: "Vui lòng xuất trình mã này cho nhân viên lễ tân khi làm thủ tục nhận phòng."
    },
    actions: {
      downloadInvoice: "Tải hoá đơn (PDF)",
      reviewRoom: "Đánh giá phòng này",
      reviewed: "Bạn đã đánh giá phòng này"
    },
    support: {
      title: "Hỗ trợ?",
      desc: "Nếu bạn cần thay đổi hoặc có yêu cầu đặc biệt cho booking này, vui lòng liên hệ bộ phận chăm sóc khách hàng.",
      hotline: "Hotline:"
    },
    reviewModal: {
      title: "Đánh giá kỳ nghỉ của bạn",
      subtitle: "Trải nghiệm của bạn sẽ giúp ích cho những khách hàng khác!",
      roomQuality: "Chất lượng phòng",
      commentLabel: "Nhận xét",
      commentPlaceholder: "Chia sẻ cảm nhận của bạn về phòng, dịch vụ, trang thiết bị...",
      publicNotice: "Đánh giá này sẽ được hiển thị công khai trên trang chi tiết phòng.",
      submit: "Gửi đánh giá ngay",
      submitting: "Đang gửi..."
    }
  },
  payments: {
    success: "Thanh toán thành công!", successMsg: "Booking của bạn đã được xác nhận.",
    cancel: "Thanh toán bị huỷ", cancelMsg: "Thanh toán bị huỷ. Booking của bạn vẫn đang chờ.",
    backToBookings: "Quay lại Booking của tôi",
    history: "Lịch sử thanh toán", noPayments: "Không có lịch sử thanh toán.",
    historySubtitle: "Quản lý và tra cứu các giao dịch của bạn tại đây.",
    loading: "Đang tải lịch sử thanh toán...",
    status: {
      SUCCESS: "Thành công",
      FAILED: "Thất bại",
      PENDING: "Đang xử lý",
      REFUNDED: "Đã hoàn tiền"
    },
    filter: {
      statusLabel: "Trạng thái",
      all: "Tất cả trạng thái",
      startDate: "Từ ngày",
      endDate: "Đến ngày"
    },
    table: {
      transactionId: "Mã giao dịch",
      product: "Sản phẩm / Kỳ hạn",
      amount: "Số tiền",
      status: "Trạng thái",
      date: "Ngày thực hiện",
      room: "Phòng {{number}}"
    },
    empty: {
      title: "Không tìm thấy giao dịch nào",
      subtitle: "Thử điều chỉnh bộ lọc để tìm kiếm kết quả khác."
    }
  },
  roomGallery: {
    imageAlt: "Phòng {{roomNumber}}",
    noImage: "Chưa có ảnh phòng",
    thumbnailAlt: "Ảnh thu nhỏ"
  },
  propertyCard: {
    perNight: "/đêm",
    totalPrice: "tổng tiền",
    featured: "Nổi bật",
    bookNow: "Đặt ngay"
  },
  bookingSearch: {
    checkInLabel: "Nhận phòng",
    checkOutLabel: "Trả phòng",
    selectDate: "Chọn ngày",
    guestsLabel: "Số khách",
    guestsCount: "{{count}} khách",
    done: "Xong",
    searching: "Đang tìm...",
    searchButton: "Tìm kiếm"
  },
  filterSidebar: {
    title: "Bộ lọc tìm kiếm",
    priceRange: "Khoảng giá",
    priceLabel: "Tầm giá",
    amenities: "Tiện ích",
    rating: "Đánh giá",
    stars: "{{count}}+ Sao"
  },
  footer: {
    copyright: "© 2026 Hotel Booking System",
    description: "Giải pháp quản lý đặt phòng chuyên nghiệp và hiện đại.",
    faq: "FAQ - Hỏi đáp",
    policy: "Chính sách & Quy định",
    version: "Version {{current}}"
  },
  notifications: {
    title: "Thông báo",
    subtitle: "Cập nhật những hoạt động mới nhất liên quan đến kỳ nghỉ của bạn.",
    systemLabel: "Hệ thống thông báo",
    markAllRead: "Đánh dấu đã đọc tất",
    unread: "Chưa đọc",
    syncing: "Đang đồng bộ...",
    viewDetails: "Xem chi tiết",
    markAsRead: "Đánh dấu đã đọc",
    empty: "Không có thông báo",
    emptyDesc: "Bạn hiện không có thông báo nào trong danh mục này.",
    newCount: "{{count}} Mới",
    viewAll: "Xem tất cả",
  },
  faq: { title: "Câu hỏi thường gặp" },
  policy: {
    title: "Chính sách bảo mật", // Key cũ của bạn
    badge: "Chính sách",
    pageTitle: "Chính sách & Quy định",
    subtitle: "Các điều khoản và quy định nhằm bảo vệ quyền lợi của khách hàng và đảm bảo chất lượng dịch vụ tốt nhất.",

    booking: {
      title: "Chính sách đặt phòng",
      point1: "Mọi yêu cầu đặt phòng sẽ được hệ thống xác nhận ngay lập tức nếu còn phòng trống và quý khách hoàn tất thủ tục thanh toán.",
      point2_part1: "Hệ thống sẽ giữ phòng cho quý khách trong vòng tối đa",
      point2_highlight: "30 phút",
      point2_part2: "kể từ khi tạo booking. Nếu sau thời gian này quý khách chưa thanh toán, booking sẽ tự động bị huỷ.",
      point3: "Thông tin xác nhận booking sẽ được gửi qua email của quý khách ngay sau khi giao dịch thành công."
    },

    cancellation: {
      title: "Chính sách huỷ phòng",
      before24h_label: "Huỷ phòng trước 24 giờ:",
      before24h_text: "Quý khách sẽ được hoàn tiền 100% qua cổng VNPay. Thời gian xử lý từ 3-5 ngày làm việc tuỳ hệ thống ngân hàng.",
      within24h_label: "Huỷ phòng trong vòng 24 giờ:",
      within24h_text: "Chúng tôi rất tiếc không thể hoàn hoàn tiền cho các trường hợp huỷ gấp sau thời gian trên.",
      noShow_label: "No-show:",
      noShow_text: "Nếu quý khách không đến nhận phòng mà không có thông báo huỷ trước đó, phí phạt sẽ tương đương với giá trị 1 đêm nghỉ đầu tiên hoặc toàn bộ booking tùy vào quy định cụ thể."
    },

    checkInOut: {
      title: "Chính sách check-in / check-out",
      checkInLabel: "Giờ nhận phòng",
      checkInTime: "Từ 14:00",
      checkOutLabel: "Giờ trả phòng",
      checkOutTime: "Trước 12:00",
      note_part1: "Việc nhận phòng sớm hoặc trả phòng muộn sau khung giờ trên sẽ bị tính phụ phí nghỉ thêm",
      note_highlight: "50% giá 1 đêm",
      note_part2: "(tuỳ thuộc vào tình trạng phòng trống tại thời điểm đó)."
    },

    privacy: {
      intro: "Tại Hotel Booking, chúng tôi cam kết tuyệt đối về an toàn dữ liệu khách hàng:",
      point1: "Toàn bộ thông tin cá nhân và tài khoản thanh toán được mã hoá theo chuẩn bảo mật SSL cao nhất.",
      point2: "Chúng tôi cam kết không chia sẻ hoặc cung cấp thông tin của quý khách cho bất kỳ bên thứ ba nào trừ trường hợp có yêu cầu từ cơ quan chức năng có thẩm quyền.",
      point3: "Quý khách có toàn quyền quản lý, sửa đổi hoặc yêu cầu xoá thông tin cá nhân của mình trực tiếp trong mục Hồ sơ."
    }
  },
  statusBadge: {
    Confirmed: "Đã xác nhận",
    Pending: "Chờ duyệt",
    Cancelled: "Đã hủy",
    CheckedIn: "Đã nhận phòng",
    CheckedOut: "Đã trả phòng"
  },
  notFound: { title: "Không tìm thấy trang", back: "Quay về trang chủ" },
  admin: {
    roomTypes: {
      eyebrow: "Cấu hình hệ thống",
      title: "Loại phòng",
      subtitle: "Quản lý các hạng phòng, giá cơ bản và sức chứa mặc định của khách sạn.",
      messages: {
        updateSuccess: "Cập nhật loại phòng thành công.",
        addSuccess: "Đã thêm loại phòng mới.",
        confirmDelete: "Bạn có chắc chắn muốn xóa loại phòng này?",
        deleteSuccess: "Đã xóa loại phòng."
      },
      form: {
        addTitle: "Thêm loại phòng mới",
        updateTitle: "Cập nhật loại phòng",
        nameLabel: "Tên loại phòng",
        namePlaceholder: "Vd: Deluxe Ocean View",
        priceLabel: "Giá cơ bản / đêm",
        capacityLabel: "Sức chứa tối đa",
        descriptionLabel: "Mô tả chi tiết",
        descriptionPlaceholder: "Mô tả ngắn gọn về đặc điểm của loại phòng này...",
        addButton: "Tạo loại phòng",
        updateButton: "Lưu thay đổi",
        cancelButton: "Hủy"
      },
      list: {
        title: "Danh sách hiện có",
        edit: "Chỉnh sửa",
        delete: "Xóa",
        priceFormat: "{{price}} USD / đêm",
        maxGuests: "Tối đa {{count}} khách",
        empty: "Không tìm thấy dữ liệu loại phòng nào."
      }
    },
    rooms: {
      eyebrow: "Quản lý tài sản",
      title: "Danh sách phòng",
      images: "Ảnh phòng",
      subtitle: "Đăng ký phòng mới, cập nhật trạng thái và gán loại phòng tương ứng.",
      roomNumber: "Số phòng", roomType: "Loại phòng", capacity: "Sức chứa",
      policies: "Chính sách", isActive: "Kích hoạt", searchPlaceholder: "Tìm số phòng...",
      filterAll: "Tất cả loại phòng", deleteConfirm: "Xoá phòng này?",
      noData: "Không tìm thấy phòng phù hợp với bộ lọc.", maxGuests: "Tối đa {{count}} khách",
      currentImages: "Ảnh hiện tại", addImages: "Thêm ảnh",
      deleteImage: "Xoá", selectAmenities: "Chọn tiện nghi",
      save: "Lưu", cancel: "Huỷ", create: "Tạo phòng", update: "Lưu thay đổi",
      viewCustomer: "Xem khách hàng",
      form: {
        addTitle: "Đăng ký phòng mới",
        updateTitle: "Cập nhật thông tin phòng",
        roomNumberPlaceholder: "Ví dụ: 301, Penthouse-1",
        statusActive: "Sẵn sàng đón khách",
        statusInactive: "Bảo trì / Khóa",
        policiesPlaceholder: "Ví dụ: Không hút thuốc,...",
        existingImages: "Ảnh hiện tại ({{count}})",
        clickToRemove: "nhấn ✕ để xóa",
        willBeDeleted: "Sẽ bị xóa",
        deleteWarning: "{{count}} ảnh sẽ bị xóa vĩnh viễn sau khi lưu.",
        addNewImages: "Thêm ảnh mới",
        uploadImages: "Tải ảnh lên",
        uploadNote: "Nhiều file (Tối đa 5MB)",
        willUpload: "Sẽ tải lên {{count}} ảnh mới:"
      },
      list: {
        title: "Danh sách phòng hiện tại ({{count}})",
        roomAlt: "Phòng {{number}}",
        noImage: "Không có ảnh",
        active: "ĐANG HOẠT ĐỘNG",
        inactive: "BẢO TRÌ",
        roomNumber: "Phòng {{number}}",
        maxCapacity: "Tối đa {{count}} khách",
        editTitle: "Chỉnh sửa phòng",
        deleteTitle: "Xóa phòng",
        viewClient: "Xem dưới góc nhìn khách hàng"
      }
    },
    bookings: {
      eyebrow: "Hệ thống quản trị",
      title: "Quản lý Đặt phòng",
      subtitle: "Theo dõi phòng, thông tin khách hàng, duyệt Check-in/Check-out và Huỷ phòng.",
      priceFormat: "{{price}} $",
      anonymousGuest: "Khách ẩn danh",
      roomNumber: "Phòng {{number}}",
      emptyList: "Chưa có booking nào trong danh sách.",
      status: {
        paid: "Đã thanh toán",
        refunded: "Đã hoàn tiền"
      },
      actions: {
        cancel: "Huỷ Phòng",
        checkIn: "Check-in",
        checkOut: "Check-out"
      },
      messages: {
        checkInSuccess: "Đã hoàn tất check-in.",
        checkOutSuccess: "Đã hoàn tất check-out.",
        confirmCancel: "Bạn có chắc chắn muốn huỷ đặt phòng này? Nếu khách đã thanh toán, hệ thống sẽ tự động hoàn tiền.",
        cancelSuccess: "Đã huỷ đặt phòng và xử lý hoàn tiền thành công."
      }
    },
    users: {
      eyebrow: "Quản trị nhân sự",
      title: "Tài khoản người dùng",
      subtitle: "Phân quyền hệ thống, quản lý trạng thái hoạt động và thông tin cơ bản của người dùng.",
      searchPlaceholder: "Tìm kiếm theo họ tên hoặc địa chỉ email...",
      sortLabel: "Sắp xếp:",
      sortDefault: "Mặc định (Mới nhất)",
      selfTag: "TÔI",
      atTime: "Lúc {{time}}",
      roles: {
        admin: "Quản trị viên",
        staff: "Nhân viên",
        user: "Khách hàng",
        adminCaps: "ADMIN",
        staffCaps: "STAFF",
        userCaps: "USER"
      },
      status: {
        active: "Đang hoạt động",
        inactive: "Đã vô hiệu"
      },
      table: {
        member: "Thành viên",
        role: "Phân quyền",
        status: "Trạng thái",
        info: "Thông tin đăng ký",
        action: "Phê duyệt"
      },
      actions: {
        activate: "Kích hoạt tài khoản",
        deactivate: "Vô hiệu hóa tài khoản"
      },
      empty: {
        title: "Dữ liệu trống",
        desc: "Không tìm thấy bất kỳ người dùng nào khớp với từ khóa \"{{search}}\"."
      },
      pagination: {
        info: "Đang hiển thị trang {{current}} / {{total}} — Tổng {{members}} thành viên"
      }
    },

    pricingRules: {
      title: "Giá theo mùa", add: "Thêm quy tắc", noData: "Chưa có quy tắc giá nào.",
      eyebrow: "Cấu hình doanh thu",
      pageTitle: "Giá theo mùa & Sự kiện",
      subtitle: "Thiết lập các quy tắc thay đổi giá tự động dựa trên thời điểm, ngày lễ hoặc cuối tuần.",
      form: {
        title: "Tạo quy tắc giá mới",
        roomType: "Loại phòng áp dụng",
        ruleName: "Tên quy tắc (Vd: Mùa du lịch Hè 2024)",
        ruleNamePlaceholder: "Vd: Ngày lễ Quốc khánh 02/09",
        priceType: "Kiểu thay đổi giá",
        typePercentage: "Tăng theo phần trăm (%)",
        typeFixed: "Cộng thêm số tiền cố định (USD)",
        startDate: "Ngày bắt đầu",
        endDate: "Ngày kết thúc",
        value: "Giá trị tăng thêm",
        applyWeekend: "Cuối tuần (T7, CN)",
        applyHolidays: "Sự kiện & Ngày lễ",
        submit: "Áp dụng quy tắc"
      },
      list: {
        title: "Quy tắc đang hiệu lực",
        removeAction: "Gỡ bỏ quy tắc",
        duration: "Thời gian",
        priceChange: "Biến động giá",
        tagWeekend: "Cuối tuần",
        tagHoliday: "Ngày lễ"
      },
      msg: {
        dateError: "Ngày bắt đầu không thể sau ngày kết thúc.",
        createSuccess: "Đã tạo luật giá mới thành công.",
        confirmDelete: "Bạn có chắc chắn muốn xóa luật giá này?",
        deleteSuccess: "Đã xóa luật giá."
      }
    },
    reports: {
      eyebrow: "Phân tích & Thống kê",
      pageTitle: "Báo cáo Doanh thu & Hiệu suất",
      subtitle: "Xem báo cáo tỷ lệ lấp đầy, phòng phổ biến và hiệu suất kinh doanh trong khoảng thời gian nhất định.",
      filter: {
        title: "Lọc báo cáo",
        startDate: "Từ ngày",
        endDate: "Đến ngày",
        submit: "Áp dụng lọc"
      },
      occupancy: {
        title: "Tỷ lệ lấp đầy phòng",
        subtitle: "Đo lường hiệu suất phòng được đặt trong giai đoạn",
        bookedRooms: "{{count}} phòng đã đặt",
        totalRooms: "Tổng {{count}} phòng",
        noData: "Không có dữ liệu cho giai đoạn này.",
        trend: "Xu hướng:",
        stable: "Ổn định",
        overThreshold: "Hiệu suất cao (>70%)"
      },
      popularRooms: {
        title: "Hạng phòng phổ biến",
        subtitle: "Top các hạng phòng được đặt nhiều nhất trong khoảng thời gian đã chọn",
        noData: "Không có dữ liệu loại phòng phổ biến.",
        idLabel: "ID:",
        bookingsCount: "{{count}} lượt đặt",
        hot: "HOT",
        suggestionLabel: "Phân tích nhanh:",
        suggestionText: "Hạng phòng \"{{roomName}}\" đang có lượt đặt cao nhất, cân nhắc tối ưu giá hoặc mở rộng số lượng phòng hạng này.",
        mostPopularFallback: "hạng phòng này"
      },

    },
    calendar: {
      eyebrow: "Quản lý vận hành",
      title: "Lịch Booking",
      subtitle: "Theo dõi tình trạng trống/đầy phòng, quản lý lịch check-in/check-out trực quan.",
      view: {
        month: "Tháng",
        week: "Tuần",
        day: "Ngày"
      },
      messages: {
        next: "Kế tiếp",
        previous: "Quay lại",
        today: "Hôm nay",
        month: "Tháng",
        week: "Tuần",
        day: "Ngày",
        agenda: "Danh sách"
      },
      modal: {
        title: "Chi tiết đặt phòng",
        roomPrefix: "ROOM",
        time: "Thời gian",
        status: "Trạng thái",
        manageBooking: "Quản lý Booking"
      },
      legend: {
        note: "Ghi chú:"
      },
      status: {
        Confirmed: "Đã xác nhận",
        Pending: "Chờ duyệt",
        Cancelled: "Đã hủy",
        CheckedIn: "Đã nhận phòng",
        CheckedOut: "Đã trả phòng"
      }
    },
    dashboard: {
      todayBookings: "Booking hôm nay",
      todayRevenue: "Doanh thu hôm nay", occupancyRate: "Tỷ lệ lấp đầy",
      pendingBookings: "Booking đang chờ",
      eyebrow: "Tổng quan hệ thống",
      pageTitle: "Bảng điều khiển",
      subtitle: "Theo dõi hiệu suất kinh doanh, quản lý các yêu cầu đặt phòng và báo cáo doanh thu theo thời gian thực.",
      viewCalendar: "Xem lịch phòng",
      error: {
        loadFailed: "Không thể tải số liệu thống kê.",
        generic: "Đã xảy ra lỗi."
      },
      kpi: {
        todayBookings: {
          title: "Đơn đặt hôm nay",
          desc: "Lượt đặt phòng mới"
        },
        todayRevenue: {
          title: "Doanh thu ngày",
          desc: "Doanh thu thực nhận"
        },
        occupancy: {
          title: "Tỷ lệ lấp đầy",
          desc: "Hiệu suất sử dụng phòng"
        },
        pending: {
          title: "Đang chờ duyệt",
          desc: "Booking cần xác nhận"
        }
      },
      chart: {
        title: "Doanh thu 7 ngày qua",
        unit: "Đơn vị: VNĐ",
        totalRevenue: "Tổng thu",
        tooltipLabel: "Doanh thu"
      },
      analysis: {
        title: "Phân tích nhanh",
        adviceLabel: "Lời khuyên ADM",
        adviceContent: "\"Hôm nay có 12 lượt khách sẽ check-out. Hãy chuẩn bị các báo cáo doanh thu cuối ngày trước 17:00.\""
      },
      recentBookings: {
        title: "Đặt phòng gần đây",
        viewAll: "Xem tất cả",
        roomPrefix: "Phòng {{number}}",
        detail: "Chi tiết",
        table: {
          customer: "Khách hàng",
          room: "Số phòng",
          status: "Trạng thái",
          action: "Hành động"
        }
      }
    },
    reviews: {
      title: "Quản lý đánh giá", approve: "Duyệt", reject: "Từ chối",

      eyebrow: "Kiểm duyệt nội dung",
      pageTitle: "Đánh giá & Phản hồi",
      subtitle: "Xem xét các trải nghiệm của khách hàng và quản lý hiển thị các bài đánh giá trên trang chủ.",
      totalFeedback: "Tổng soát: {{count}} lượt feedback",
      roomName: "Phòng {{number}}",
      noComment: "Không có nội dung nhận xét.",
      emptyTitle: "Danh sách trống",
      noData: "Hiện chưa có khách hàng nào gửi đánh giá cho hệ thống.",
      table: {
        customer: "Khách hàng",
        product: "Sản phẩm",
        rating: "Xếp hạng",
        content: "Nội dung bài viết",
        moderation: "Kiểm duyệt",
        visibility: "Ẩn/Hiện"
      },
      status: {
        public: "Công khai",
        hidden: "Đã ẩn"
      },
      action: {
        hide: "Ẩn bài viết",
        show: "Công khai bài viết"
      }
    },
  },
  common: {
    save: "Lưu", cancel: "Huỷ", edit: "Sửa", delete: "Xóa",
    success: "Thành công", error: "Lỗi", loading: "Đang tải...",
    confirm: "Xác nhận", back: "Quay lại", close: "Đóng", search: "Tìm kiếm",
    filter: "Lọc", all: "Tất cả", active: "Hoạt động", inactive: "Ngừng hoạt động",
    yes: "Có", no: "Không", noData: "Không có dữ liệu", retry: "Thử lại",
    pagination: {
      showing: "Đang hiển thị trang {{page}} / {{totalPages}}",
      totalReviews: "Tổng số {{count}} đánh giá"
    }
  },
  uniqueSection: {
    eyebrow: "Tại sao chọn chúng tôi",
    title: "Điều gì khiến chúng tôi khác biệt",
    points: {
      quality: {
        title: "Chất lượng & Tiện nghi hàng đầu",
        desc: "Phòng được tuyển chọn kỹ lưỡng, đánh giá TB 4.8★",
        badge: "4.8★ Avg Rating"
      },
      price: {
        title: "Đảm bảo giá tốt nhất",
        desc: "Chúng tôi đảm bảo giá cạnh tranh nhất cho mọi lựa chọn."
      },
      secure: {
        title: "Thanh toán bảo mật",
        desc: "Giao dịch được mã hóa SSL, bảo vệ qua cổng VNPay."
      },
      refund: {
        title: "Hoàn tiền dễ dàng",
        desc: "Hủy trước 24h → hoàn 100%, không câu hỏi thêm."
      }
    },
    stats: {
      rooms: "Phòng sẵn có",
      bookings: "Lượt đặt phòng",
      rating: "Đánh giá trung bình",
      satisfaction: "Khách hàng hài lòng"
    }
  },
  testimonials: {
    eyebrow: "Khách hàng nói gì",
    title: "Trải nghiệm thực từ khách hàng của chúng tôi",
    list: [
      {
        quote: "Tôi đã đặt phòng qua đây và trải nghiệm thực sự tuyệt vời! Quy trình nhanh chóng, phòng sạch sẽ và nhân viên rất thân thiện.",
        author: "Nguyễn Minh Tuấn",
        location: "Hà Nội"
      },
      {
        quote: "Giá cả hợp lý, phòng đẹp hơn mong đợi. Sẽ tiếp tục sử dụng dịch vụ cho những chuyến đi tiếp theo.",
        author: "Trần Thị Lan",
        location: "TP. Hồ Chí Minh"
      },
      {
        quote: "Hệ thống đặt phòng trực quan, dễ dùng. Tôi thích tính năng xem lịch và giá theo ngày.",
        author: "Phạm Quốc Hùng",
        location: "Đà Nẵng"
      }
    ]
  },
  awardSection: {
    eyebrow: "Giải thưởng quốc tế",
    title: "Được công nhận toàn cầu với các giải thưởng dịch vụ khách sạn xuất sắc.",
    subtitle: "Chúng tôi không chỉ cung cấp chỗ ở — chúng tôi tạo ra kỳ nghỉ đáng nhớ.",
    stats: {
      years: "Năm kinh nghiệm",
      awards: "Giải thưởng"
    },
    card: {
      specs: "khách · phòng ngủ · WC",
      price: "200$/đêm",
      bookNow: "Đặt ngay"
    }
  },
  roomPriceCard: {
    title: "Thông tin giá",
    basePriceLabel: "Giá cơ bản (theo loại phòng):",
    contact: "Liên hệ",
    backToSearch: "Quay lại tìm phòng"
  },
  bookingForm: {
    title: "Thông tin đặt phòng",
    checkIn: "Ngày nhận phòng",
    checkOut: "Ngày trả phòng",
    selectDate: "Chọn ngày",
    guests: "Số khách",
    guestsCount: "{{count}} khách (tối đa {{max}})",
    guestLabel: "Khách",
    done: "Xong",
    quotePrice: "Tính giá",
    calculating: "Đang tính giá...",
    summary: "{{nights}} đêm · ${{price}}/đêm",
    addRoom: "Thêm phòng",
    bookAndPay: "Đặt & thanh toán",
    processing: "Đang xử lý...",
    hint: "Gợi ý: hãy bấm \"Tính giá\" để xem tổng tiền trước khi đặt.",
    specialRequest: "Yêu cầu đặc biệt (tuỳ chọn) — sẽ bổ sung ở bước sau"
  }
};

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: 'vi',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;

