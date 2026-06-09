import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/auth.service";
import { canView, canCreate, savePermissions } from "../utils/permissions";
import axiosInstance from "../api/axiosInstance";

// Refreshed once per full page load (module-level flag resets on F5 / hard reload)
let _permRefreshedThisLoad = false;

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  // bump this to force sidebar to re-read localStorage after permissions refresh
  const [, setPermTick] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_role");

  const handleLogout = async () => {
    _permRefreshedThisLoad = false; // reset so next login fetches fresh permissions
    await authService.logout();
    navigate("/sign-in");
  };

  // Refresh permissions from backend once per page load for non-admin users.
  // This ensures sidebar reflects permission changes made by admin without requiring re-login.
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (!_permRefreshedThisLoad && role && role !== "ADMIN") {
      _permRefreshedThisLoad = true;
      axiosInstance
        .get("/accounts/role-permissions/by-role/", { params: { role } })
        .then((res) => {
          const perms = res.data?.result || res.data?.results || [];
          savePermissions(Array.isArray(perms) ? perms : []);
          setPermTick((t) => t + 1); // trigger sidebar re-render with fresh permissions
        })
        .catch(() => {
          _permRefreshedThisLoad = false; // allow retry on next mount if request failed
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
            ? "sidebar sidebar-open"
            : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        <div>
          <Link to='/dashboard' className='sidebar-logo'>
            <img
              src='assets/images/logo.jpeg'
              alt='site logo'
              className='light-logo'
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <img
              src='assets/images/logo.jpeg'
              alt='site logo'
              className='dark-logo'
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <img
              src='assets/images/logo.jpeg'
              alt='site logo'
              className='logo-icon'
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          </Link>
        </div>
        <div className='sidebar-menu-area'>
          <ul className='sidebar-menu' id='sidebar-menu'>
            <li>
              <NavLink
                to='/dashboard'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon='solar:home-smile-angle-outline' className='menu-icon' />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li className='sidebar-menu-group-title'>Management</li>

            {/* Programs */}
            {canView("PROGRAMS") && (
              <li className='dropdown'>
                <Link to='#'>
                  <Icon icon='solar:book-outline' className='menu-icon' />
                  <span>Programs</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink to='/programs' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> List Programs
                    </NavLink>
                  </li>
                  {userRole === "ADMIN" && (
                    <li>
                      <NavLink to='/program-add' className={(n) => n.isActive ? "active-page" : ""}>
                        <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Add Program
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Semesters — admin + teacher only */}
            {canView("SEMESTERS") && userRole !== "STUDENT" && (
              <li className='dropdown'>
                <Link to='#'>
                  <Icon icon='solar:calendar-outline' className='menu-icon' />
                  <span>Semesters</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink to='/semesters' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> List Semesters
                    </NavLink>
                  </li>
                  {userRole === "ADMIN" && (
                    <li>
                      <NavLink to='/semester-add' className={(n) => n.isActive ? "active-page" : ""}>
                        <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Add Semester
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Courses */}
            {canView("COURSES") && (
              <li className='dropdown'>
                <Link to='#'>
                  <Icon icon='solar:notebook-outline' className='menu-icon' />
                  <span>Courses</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink to='/courses' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> List Courses
                    </NavLink>
                  </li>
                  {userRole === "ADMIN" && (
                    <li>
                      <NavLink to='/course-add' className={(n) => n.isActive ? "active-page" : ""}>
                        <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Add Course
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Course Assignments — Student sees nothing; Admin: All+Assign; Teacher: My Courses */}
            {canView("COURSE_ASSIGNMENTS") && userRole !== "STUDENT" && (
              <li className='dropdown'>
                <Link to='#'>
                  <Icon icon='solar:bookmark-square-minimalistic-outline' className='menu-icon' />
                  <span>Course Assignments</span>
                </Link>
                <ul className='sidebar-submenu'>
                  {userRole === "ADMIN" && (
                    <>
                      <li>
                        <NavLink to='/course-assignments' className={(n) => n.isActive ? "active-page" : ""}>
                          <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> All Assignments
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to='/course-assignment-add' className={(n) => n.isActive ? "active-page" : ""}>
                          <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Assign Course
                        </NavLink>
                      </li>
                    </>
                  )}
                  {userRole === "TEACHER" && (
                    <li>
                      <NavLink to='/my-courses' className={(n) => n.isActive ? "active-page" : ""}>
                        <i className='ri-circle-fill circle-icon text-info-main w-auto' /> My Courses
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Users */}
            {canView("USERS") && (
              <li className='dropdown'>
                <Link to='#'>
                  <Icon icon='solar:users-group-rounded-outline' className='menu-icon' />
                  <span>Users</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink to='/users' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> List Users
                    </NavLink>
                  </li>
                  {canCreate("USERS") && (
                    <li>
                      <NavLink to='/user-add' className={(n) => n.isActive ? "active-page" : ""}>
                        <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Add User
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Assessments — all authenticated roles */}
            <li className='dropdown'>
              <Link to='#'>
                <Icon icon='solar:document-add-outline' className='menu-icon' />
                <span>Assessments</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink to='/generated-papers' className={(n) => n.isActive ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> Generated Papers
                  </NavLink>
                </li>
                {userRole === "TEACHER" && (
                  <li>
                    <NavLink to='/generate-paper' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Generate Paper
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink to='/generated-quizzes' className={(n) => n.isActive ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> Generated Quizzes
                  </NavLink>
                </li>
                {userRole === "TEACHER" && (
                  <li>
                    <NavLink to='/generate-quiz' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Generate Quiz
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink to='/generated-assignments' className={(n) => n.isActive ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> Generated Assignments
                  </NavLink>
                </li>
                {userRole === "TEACHER" && (
                  <li>
                    <NavLink to='/generate-assignment' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Generate Assignment
                    </NavLink>
                  </li>
                )}
              </ul>
            </li>

            {/* PLO — admin only */}
            {localStorage.getItem("user_role") === "ADMIN" && (
              <li className='dropdown'>
                <Link to='#'>
                  <Icon icon='solar:diploma-outline' className='menu-icon' />
                  <span>PLOs</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink to='/plos' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> List PLOs
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/plo-add' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Add PLO
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/plo-bulk-upload' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-warning-main w-auto' /> Bulk Upload PLOs
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}

            {/* CLO — admin only */}
            {localStorage.getItem("user_role") === "ADMIN" && (
              <li className='dropdown'>
                <Link to='#'>
                  <Icon icon='solar:clipboard-list-outline' className='menu-icon' />
                  <span>CLOs</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink to='/clos' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> List CLOs
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/clo-add' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-success-main w-auto' /> Add CLO
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/clo-bulk-upload' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-warning-main w-auto' /> Bulk Upload CLOs
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/clo-plo-generator' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-purple w-auto' /> Generate CLO-PLO
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}

            {/* Role Permissions — admin only */}
            {localStorage.getItem("user_role") === "ADMIN" && (
              <li className='dropdown'>
                <Link to='#'>
                  <Icon icon='solar:shield-keyhole-outline' className='menu-icon' />
                  <span>Role Permissions</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink to='/role-permissions' className={(n) => n.isActive ? "active-page" : ""}>
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' /> Manage Permissions
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}

          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  className='sidebar-toggle'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
                <form className='navbar-search'>
                  <input type='text' name='search' placeholder='Search' />
                  <Icon icon='ion:search-outline' className='icon' />
                </form>
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* ThemeToggleButton */}
                <ThemeToggleButton />
                <div className='dropdown d-none d-sm-inline-block'>
                  <button
                    className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <img
                      src='assets/images/lang-flag.png'
                      alt='Wowdash'
                      className='w-24 h-24 object-fit-cover rounded-circle'
                    />
                  </button>
                  
                  <div className='dropdown-menu to-top dropdown-menu-sm'>

                    <ul className='to-top-list'>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/view-profile'
                        >
                          <Icon icon='solar:user-linear' className='icon text-xl' />{" "}
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/view-profile?tab=password'
                        >
                          <Icon icon='solar:lock-password-outline' className='icon text-xl' />{" "}
                          Change Password
                        </Link>
                      </li>
                      <li>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleLogout(); }}
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3"
                        >
                          <Icon icon='ri:logout-box-line' className='icon text-xl' />
                          Log Out
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>{children}</div>

        {/* Footer section */}
        <footer className='d-footer'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <p className='mb-0'>© 2026.All Rights Reserved.</p>
            </div>
            <div className='col-auto'>
              <p className='mb-0'>
                 <span className='text-primary-600'></span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default MasterLayout;
