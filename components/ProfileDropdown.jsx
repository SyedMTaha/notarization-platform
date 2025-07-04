import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import classNames from "classnames";
import Link from "next/link";
const ProfileDropdown = (props) => {
  const profilePic = props["profilePic"] || null;
  const username = props["username"] || null;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /*
   * toggle profile-dropdown
   */
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
      <Dropdown.Toggle
        id="dropdown-profile"
        as="a"
        onClick={toggleDropdown}
        className={classNames(
          "nav-link nav-user me-0 waves-effect waves-light",
          {
            show: dropdownOpen,
          }
        )}
      >
        <img src={profilePic} className="rounded-circle" alt="" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu dropdown-menu-end profile-dropdown">
        <div onClick={toggleDropdown}>
          <div className="dropdown-header noti-title">
            <h6 className="text-overflow m-0">Welcome {username}</h6>
          </div>
          {(props.menuItems || []).map((item, i) => {
            return (
              <React.Fragment key={i}>
                {i === props["menuItems"].length - 1 && (
                  <div className="dropdown-divider"></div>
                )}
                <Link
                  href={item.redirectTo}
                  className="dropdown-item notify-item"
                  key={i + "-profile-menu"}
                >
                  <i className={`${item.icon} me-1`}></i>
                  <span>{item.label}</span>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};
export default ProfileDropdown;
