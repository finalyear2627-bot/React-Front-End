import React from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
const Breadcrumb = ({ title }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24'>
      <div className='d-flex align-items-center gap-12'>
        <button
          type='button'
          onClick={handleBack}
          className='w-36-px h-36-px bg-white border border-neutral-200 rounded-circle d-inline-flex align-items-center justify-content-center text-secondary-light hover-bg-neutral-100'
          aria-label='Go back'
          title='Back'
        >
          <Icon icon='mingcute:arrow-left-line' className='text-lg' />
        </button>
        <h6 className='fw-semibold mb-0'>{title}</h6>
      </div>
      <ul className='d-flex align-items-center gap-2'>
        <li className='fw-medium'>
          <Link
            to='/dashboard'
            className='d-flex align-items-center gap-1 hover-text-primary'
          >
            <Icon
              icon='solar:home-smile-angle-outline'
              className='icon text-lg'
            />
            Dashboard
          </Link>
        </li>
        <li> - </li>
        <li className='fw-medium'>{title}</li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
