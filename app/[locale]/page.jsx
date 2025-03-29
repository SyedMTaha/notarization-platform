"use client";
import ClientsFeedback from "@/components/home1/ClientsFeedback";
import Hero1 from "@/components/home1/Hero1";
import Layout from "@/layout/Layout";
import SideBar from "@/layout/SideBar";
import { sideBarToggle } from "@/utility";
import { useTranslations } from "next-intl";
import Head from "next/head";
import Link from "next/link";
import { Accordion } from "react-bootstrap";
import { faqsData1, faqsData2 } from "./help-desk/page";
import OxencyAccordion from "@/components/OxencyAccordion";
import { useState } from "react";
import LangSwitcher from "@/components/LangSwitch";

const IndexOnePage = ({ params }) => {
  const t = useTranslations();
  const { locale, slug } = params;

  const [active, setActive] = useState(`a0`);
  const onClick = (value) => {
    setActive(value === active ? "" : value);
  };
  return (
    <Layout className="home-one" footer={1} noHeader>
      <Head>
        {" "}
        <Link
          legacyBehavior
          rel="shortcut icon"
          href="/assets/images/favicon.png"
          type="image/x-icon"
        />
      </Head>
      <header className="main-header header-two">
        {/*Header-Upper*/}
        <div className="header-upper">
          <div className="container clearfix">
            <div className="header-inner rel d-flex align-items-center">
              <div className="logo-outer">
                <div className="logo">
                  <Link legacyBehavior href="/">
                    <a>
                      <img
                        src="/assets/images/logos/logo-white.png"
                        alt={t("logo_alt")}
                        title={t("logo_title")}
                      />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="nav-outer clearfix">
                {/* Main Menu */}
                <nav className="main-menu navbar-expand-lg">
                  <Accordion>
                    <div className="navbar-header">
                      <div className="mobile-logo my-15">
                        <Link legacyBehavior href="/">
                          <a>
                            <img
                              src="/assets/images/logos/logo-white.png"
                              alt={t("navbar.mobile_logo_alt")}
                              title={t("logo_title")}
                            />
                          </a>
                        </Link>
                      </div>
                      {/* Toggle Button */}
                      <Accordion.Toggle
                        eventKey="nav"
                        as="button"
                        className="navbar-toggle"
                      >
                        <span className="icon-bar" />
                        <span className="icon-bar" />
                        <span className="icon-bar" />
                      </Accordion.Toggle>
                    </div>
                    <Accordion.Collapse
                      eventKey="nav"
                      className="navbar-collapse clearfix"
                    >
                      <ul className="navigation onepage clearfix">
                        <li>
                          <Link href="#home">{t("navbar.home")}</Link>
                        </li>
                        <li>
                          <Link href="/about">{t("navbar.about")}</Link>
                        </li>
                        <li>
                          <Link className="disabled-link" href="/faqs/0">{t("navbar.Standard_Forms")}</Link>
                        </li>
                        <li>
                          <a className="disabled-link" href="#project">{t("navbar.authenticate")}</a>
                        </li>
                        <li>
                          <Link href="/help-desk">{t("navbar.help")}</Link>
                        </li>
                        <li>
                          <a href="#contact">{t("navbar.contact")}</a>
                        </li>
                      </ul>
                    </Accordion.Collapse>
                  </Accordion>
                </nav>
                {/* Main Menu End*/}
              </div>
              {/* Nav Search */}
              <div className="nav-search py-15">
                <button className="far fa-search" />
                <form
                  onSubmit={(e) => e.preventDefault()}
                  action="#"
                  className="hide"
                >
                  <input
                    type="text"
                    placeholder={t("navbar.search_placeholder")}
                    className="searchbox"
                    required=""
                  />
                  <button
                    type="submit"
                    className="searchbutton far fa-search"
                  />
                </form>
              </div>
              {/* Menu Button */}
              <div className="menu-btns">
                <Link legacyBehavior href="/auth/signin">
                  <a className="theme-btn style-three">
                    {t("navbar.login")}{" "}
                    <i className="fas fa-angle-double-right" />
                  </a>
                </Link>
                <LangSwitcher
                  locale={locale}
                />
                {/* menu sidebar */}
                <div className="menu-sidebar d-none d-md-block">
                  <button onClick={() => sideBarToggle()}>
                    <span className="icon-bar" />
                    <span className="icon-bar" />
                    <span className="icon-bar" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*End Header Upper*/}
      </header>

      <SideBar />
      {/*End Hidden Sidebar */}
      {/* Slider Section Start */}
      <Hero1 />
      {/* Slider Section End */}
      {/* Working Process Area start */}
      <section className="work-process-area pt-100 rel z-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="section-title text-center mb-55 wow fadeInUp delay-0-2s">
                <span className="sub-title mb-15">{t("working_process")}</span>
                <h2>{t("how_we_work")}</h2>
              </div>
            </div>
          </div>
          <div className="work-process-wrap rel z-1">
            <div className="row justify-content-between">
              <div className="col-xl-3 col-lg-5 col-sm-6">
                <div className="work-process-item mt-30 wow fadeInUp delay-0-2s">
                  <div className="icon">
                    <span className="number">01</span>
                    <i className="flaticon-optimization" />
                  </div>
                  <h4>{t("info_gathering")}</h4>
                  <p>{t("info_gathering_desc")}</p>
                </div>
              </div>
              <div className="col-xl-3 col-lg-5 col-sm-6">
                <div className="work-process-item wow fadeInUp delay-0-4s">
                  <div className="icon">
                    <span className="number">02</span>
                    <i className="flaticon-link" />
                  </div>
                  <h4>{t("idea_planning")}</h4>
                  <p>{t("idea_planning_desc")}</p>
                </div>
              </div>
              <div className="col-xl-3 col-lg-5 col-sm-6">
                <div className="work-process-item mt-55 wow fadeInUp delay-0-6s">
                  <div className="icon">
                    <span className="number">03</span>
                    <i className="flaticon-data" />
                  </div>
                  <h4>{t("design_analysis")}</h4>
                  <p>{t("design_analysis_desc")}</p>
                </div>
              </div>
              <div className="col-xl-3 col-lg-5 col-sm-6">
                <div className="work-process-item mt-45 wow fadeInUp delay-0-8s">
                  <div className="icon">
                    <span className="number">04</span>
                    <i className="flaticon-star" />
                  </div>
                  <h4>{t("testing_launch")}</h4>
                  <p>{t("testing_launch_desc")}</p>
                </div>
              </div>
            </div>
            <div className="work-process-shape">
              <img
                src="/assets/images/shapes/worp-process-step.png"
                alt="Shape"
              />
            </div>
          </div>
        </div>
      </section>
      {/* About Us Area start */}
      <section id="about" className="about-area-one pt-130 pb-125 rel z-1">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-5">
              <div className="about-image-one bg-squire-shape rmb-85 wow fadeInUp delay-0-2s ">
                <img
                  src="/assets/images/about/about-one.jpg"
                  alt={t("about_digital_solutions")}
                />
                <img
                  className="image-left"
                  src="/assets/images/shapes/image-left.png"
                  alt="shape"
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-7">
              <div className="about-content-one wow fadeInUp delay-0-4s">
                <div className="section-title mb-45">
                  <span className="sub-title mb-15">
                    {t("about_digital_solutions")}
                  </span>
                  <h2>{t("best_web_design_solutions")}</h2>
                </div>
                <ul className="list-style-one">
                  <li>
                    <div className="content">
                      <h4>{t("company_mission")}</h4>
                      <p>{t("company_mission_text")}</p>
                    </div>
                  </li>
                  <li>
                    <div className="content">
                      <h4>{t("company_vision")}</h4>
                      <p>{t("company_vision_text")}</p>
                    </div>
                  </li>
                  <li>
                    <div className="content">
                      <h4>{t("our_philosophy")}</h4>
                      <p>{t("our_philosophy_text")}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Area end */}

      {/* Core Feature start */}
      <section className="feature-area-five bgc-lighter pt-100 pb-70">
        <div className="container">
          <div className="section-title text-center mb-60 wow fadeInUp delay-0-2s">
            <span className="sub-title mb-10">
              {t("core_features.core_features")}
            </span>
            <h2>{t("core_features.heading")}</h2>
          </div>
          <div className="row row-cols-xl-6 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 justify-content-center">
            <div className="col wow fadeInUp delay-0-2s">
              <div className="feature-item-five">
                <img
                  className="mb-20"
                  src="/assets/images/shapes/ProfileIcon.png"
                />

                <h5>
                  <Link legacyBehavior href="/service-details">
                    <a>{t("core_features.responsive_design")}</a>
                  </Link>
                </h5>
              </div>
            </div>
            <div className="col wow fadeInUp delay-0-3s">
              <div className="feature-item-five">
                <img
                  className="mb-20"
                  src="/assets/images/shapes/Notefold.png"
                />

                <h5>
                  <Link legacyBehavior href="/service-details">
                    <a>{t("core_features.powerful_customization")}</a>
                  </Link>
                </h5>
              </div>
            </div>
            <div className="col wow fadeInUp delay-0-4s">
              <div className="feature-item-five">
                <img
                  className="mb-20"
                  src="/assets/images/shapes/Checkmark.png"
                />

                <h5>
                  <Link legacyBehavior href="/service-details">
                    <a>{t("core_features.cool_modern_animations")}</a>
                  </Link>
                </h5>
              </div>
            </div>
            <div className="col wow fadeInUp delay-0-5s">
              <div className="feature-item-five">
                <img
                  className="mb-20"
                  src="/assets/images/shapes/DocFold.png"
                />

                <h5>
                  <Link legacyBehavior href="/service-details">
                    <a>{t("core_features.seo_friendly_coding")}</a>
                  </Link>
                </h5>
              </div>
            </div>
            <div className="col wow fadeInUp delay-0-6s">
              <div className="feature-item-five">
                <img className="mb-20" src="/assets/images/shapes/Law.png" />

                <h5>
                  <Link legacyBehavior href="/service-details">
                    <a>{t("core_features.best_technical_supports")}</a>
                  </Link>
                </h5>
              </div>
            </div>
            <div className="col wow fadeInUp delay-0-7s">
              <div className="feature-item-five">
                <img
                  className="mb-20"
                  src="/assets/images/shapes/Exclamation.png"
                />

                <h5>
                  <Link legacyBehavior href="/service-details">
                    <a>{t("core_features.varied_layouts_parallax")}</a>
                  </Link>
                </h5>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Core Feature end */}

      {/* Design Featured Start */}
      <section
        id="featured"
        className="design-feature-area overflow-hidden pt-130 pb-100 text-white bgc-black-with-lighting rel z-1"
      >
        <div className="w-75  mx-auto ">
          <div className="section-title text-center mb-60 wow fadeInUp delay-0-2s">
            <span className="sub-title mb-10">{t("core_design_features")}</span>
            <h2>{t("website_services")}</h2>
          </div>
          <div className="row gap-1 flex-lg-nowrap align-items-center  ">
            <div className="col-lg-3 ">
              <div className="feature-left ">
                <div className=" mx-1 ">
                  <div className="col-lg-12 col-sm-6">
                    <div className="service-item style-three wow fadeInRight delay-0-2s">
                      <div className="icon">
                        <i className="flaticon-design" />
                      </div>
                      <div className="content d-flex flex-column  p-5 gap-2">
                        <h4>
                          <Link legacyBehavior href="/service-details">
                            <a>{t("website_creation")}</a>
                          </Link>
                        </h4>
                        <p>{t("website_creation_desc")} </p>
                        <Link legacyBehavior href="/service-details">
                          <div
                            style={{
                              border: "1px solid #416976",
                              borderRadius: "27px",
                            }}
                            className="d-flex flex-row align-items-center p-10 justify-content-center gap-4"
                          >
                            <a style={{ color: "#416976" }}>
                              {t("learn_more")}
                            </a>
                            <img
                              style={{ width: "15px" }}
                              src="/assets/images/shapes/fast-forward.png"
                            />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 ">
              <div className="feature-middle  rmt-30">
                <div className="image  wow fadeInUp delay-0-2s d-flex justify-content-center  align-items-center position-relative z-1">
                  {locale === "en" ? (
                    <img
                      className="circle-text"
                      src="/assets/images/shapes/feature-image-top.png"
                      alt="Text"
                    />
                  ) : (
                    <img
                      className="circle-text w-75 mb-md-0 mb-20 "
                      style={{ marginBottom: "20px" }}
                      src="/assets/images/shapes/feature-image-top-spanish.png"
                      alt="Text"
                    />
                  )}

                  <img
                    className={`round w-50   ${
                      locale === "en" ? "mt-10" : "mt-20"
                    } mx-auto`}
                    src="/assets/images/features/feature-middle.png"
                    alt="Feature Middle"
                  />
                </div>
                <div className="row mt-md-5  rmt-30 position-relative  z-3">
                  <div className="col-sm-6 text-black">
                    <div className="service-item style-three wow fadeInUp delay-0-3s">
                      <div className="icon">
                        <i className="flaticon-online" />
                      </div>
                      <div className="content d-flex flex-column  p-5 gap-2">
                        <h4>
                          <Link legacyBehavior href="/service-details">
                            <a>{t("ecommerce_solutions")}</a>
                          </Link>
                        </h4>
                        <p>{t("ecommerce_solutions_desc")} </p>
                        <Link legacyBehavior href="/service-details">
                          <div
                            style={{
                              border: "1px solid #416976",
                              borderRadius: "27px",
                            }}
                            className="d-flex flex-row align-items-center p-10 justify-content-center gap-4"
                          >
                            <a style={{ color: "#416976" }}>
                              {t("learn_more")}
                            </a>
                            <img
                              style={{ width: "15px" }}
                              src="/assets/images/shapes/fast-forward.png"
                            />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="service-item style-three mt-30 wow fadeInUp delay-0-4s">
                      <div className="icon">
                        <i className="flaticon-web-programming" />
                      </div>
                      <div className="content d-flex flex-column  p-5 gap-2">
                        <h4>
                          <Link legacyBehavior href="/service-details">
                            <a>{t("responsive_ui_ux")}</a>
                          </Link>
                        </h4>
                        <p>{t("responsive_ui_ux_desc")} </p>
                        <Link legacyBehavior href="/service-details">
                          <div
                            style={{
                              border: "1px solid #416976",
                              borderRadius: "27px",
                            }}
                            className="d-flex flex-row align-items-center p-10 justify-content-center gap-4"
                          >
                            <a style={{ color: "#416976" }}>
                              {t("learn_more")}
                            </a>
                            <img
                              style={{ width: "15px" }}
                              src="/assets/images/shapes/fast-forward.png"
                            />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 -ml-5 ">
              <div className="feature-right">
                <div className="mx-1">
                  <div className="col-lg-12  col-sm-6">
                    <div className="service-item  style-three  wow fadeInLeft delay-0-2s">
                      <div className="icon">
                        <i className="flaticon-graphic-design" />
                      </div>
                      <div className="content d-flex flex-column  p-5 gap-2">
                        <h4>
                          <Link legacyBehavior href="/service-details">
                            <a>{t("seo_services")}</a>
                          </Link>
                        </h4>
                        <p>{t("seo_services_desc")} </p>
                        <Link legacyBehavior href="/service-details">
                          <div
                            style={{
                              border: "1px solid #416976",
                              borderRadius: "27px",
                            }}
                            className="d-flex flex-row align-items-center p-10 justify-content-center gap-4"
                          >
                            <a style={{ color: "#416976" }}>
                              {t("learn_more")}
                            </a>
                            <img
                              style={{ width: "15px" }}
                              src="/assets/images/shapes/fast-forward.png"
                            />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="design-feature-shapes">
          <img
            className="shape dots"
            src="/assets/images/shapes/slider-dots.png"
            alt="Shape"
          />
          <img
            className="shape wave-line"
            src="/assets/images/shapes/feature-wave-line.png"
            alt="Shape"
          />
        </div>
      </section>

      {/* Design Featured End */}
      {/* Project Area start */}
      {/* <RecentProjects /> */}
      {/* Project Area end */}

      {/* Pricing Two Area start */}
      <section
        id="pricing"
        className="pricing-area-two bgc-lighter pt-240 pb-100 rel z-1"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="section-title text-center mb-55 wow fadeInUp delay-0-2s">
                <span className="sub-title mb-15">{t("pricing_section")}</span>
                <h2>{t("website_design_packages")}</h2>
              </div>
            </div>
          </div>
          <div className="row d-flex flex-row align-items-stretch">
            {[
              { price: 15, per: t("per_notary_seal") },
              { price: 25, per: t("per_two_signatories") },
            ].map((item, index) => (
              <div key={index} className="col-lg-6 ">
                <div
                  className={`pricing-item-two wow border h-100 p-10 d-flex justify-content-stretch align flex-column fadeInUp delay-0-${
                    index % 2 === 0 ? 2 : 4
                  }s`}
                >
                  <span className="badge">{t("popular_package")}</span>
                  <div className="pricing-inner d-flex mt-30 align-items-start">
                    <ul className="list-style-two mt-10">
                      <li>{t("landing_page_design")}</li>
                      <li>{t("html_css_design")}</li>
                      <li>{t("social_media_marketing")}</li>
                      <li>{t("domain_hosting_provider")}</li>
                    </ul>
                    <div className="price-and-btn">
                      <div className="content">
                        <div className="d-flex flex-row align-items-baseline gap-2">
                          <h2 style={{ color: "#416976" }}>${item.price}</h2>
                          <p className="fs-5">/ {item.per}</p>
                        </div>
                        <span className="save">
                          {item.price === 15 ? (
                            <span> + $10 / {t("additional_witness")} </span>
                          ) : (
                            <div
                              style={{ lineHeight: ".5", paddingTop: "10px" }}
                            >
                              <p>+ $10 / {t("additional_signatory")}</p>
                              <p>+ $10 / {t("witness")}</p>
                              <p className="text-nowrap">
                                + $10 / {t("additional_notary_seal")}
                              </p>
                            </div>
                          )}
                        </span>
                        <Link legacyBehavior href="/pricing">
                          <a className="theme-btn style-three fw-bold">
                            {t("choose_package")}{" "}
                            <i className="fas fa-angle-double-right" />
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pricing-shapes">
          <img
            className="shape dots"
            src="/assets/images/shapes/pricing-bg-dots.png"
            alt="Shape"
          />
          <img
            className="shape wave"
            src="/assets/images/shapes/pricing-wave-line.png"
            alt="Shape"
          />
        </div>
      </section>

      {/* Pricing Two Area end */}
      {/* Call-To-Action Area */}
      <section className="call-to-action-area rel pb-60 z-2">
        <div className="container">
          <div
            className="cta-inner bgs-cover"
            style={{
              backgroundImage: "url(/assets/images/background/cta-bg.jpg)",
            }}
          >
            <div className="row">
              <div className="col-xl-6  w-75 mx-auto">
                <div className="cta-item  wow fadeInLeft delay-0-2s">
                  <div className="icon">
                    <i className="flaticon-target" />
                  </div>
                  <h4 className="w-100">{t("cta_project_title")}</h4>
                  <Link legacyBehavior href="/contact">
                    <a className="details-btn">
                      <i className="far fa-arrow-right" />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Area end */}
      {/* Testimonial Area Start */}
      <ClientsFeedback />
      {/* Testimonial Area End */}
      {/* Contact Area Start */}
      <section
        id="contact"
        className="contact-area overflow-hidden py-130 bgc-black-with-lighting rel z-1"
      >
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-xl-5 col-lg-6">
              <div className="contact-info-area text-white rmb-75 wow fadeInLeft delay-0-2s">
                <div className="section-title mb-55">
                  <h2>{t("contact_section")}</h2>
                </div>
                <div className="contact-info-wrap">
                  <div className="contact-info-item">
                    <div className="icon">
                      <i className="fal fa-map-marker-alt" />
                    </div>
                    <div className="content">
                      <span className="title">{t("location")}</span>
                      <b className="text">{t("location_address")}</b>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <div className="icon">
                      <i className="far fa-envelope-open-text" />
                    </div>
                    <div className="content">
                      <span className="title">{t("email_address")}</span>
                      <b className="text">
                        <a href="mailto:support@gmail.com">{t("email")}</a>
                      </b>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <div className="icon">
                      <i className="far fa-phone" />
                    </div>
                    <div className="content">
                      <span className="title">{t("phone_number")}</span>
                      <b className="text">
                        <a href="callto:+000(123)45699">{t("phone")}</a>
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-5 col-lg-6">
              <form
                onSubmit={(e) => e.preventDefault()}
                id="contact-area-form"
                className="contact-area-form text-center wow fadeInRight delay-0-2s"
                name="contact-area-form"
                action="#"
                method="post"
              >
                <h4>{t("send_us_message")}</h4>
                <input
                  type="text"
                  id="full-name"
                  name="full-name"
                  className="form-control"
                  placeholder={t("full_name_placeholder")}
                  required
                />
                <input
                  type="email"
                  id="blog-email"
                  name="blog-email"
                  className="form-control"
                  placeholder={t("email_placeholder")}
                  required
                />
                <input
                  type="text"
                  id="website"
                  name="website"
                  className="form-control"
                  placeholder={t("website_placeholder")}
                  required
                />
                <textarea
                  name="message"
                  id="message"
                  className="form-control"
                  rows={5}
                  placeholder={t("message_placeholder")}
                  required
                />
                <button type="submit" className="theme-btn">
                  {t("send_message_button")}{" "}
                  <i className="fas fa-angle-double-right" />
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="contact-shapes">
          <img
            className="shape circle"
            src="/assets/images/shapes/slider-dots.png"
            alt="Shape"
          />
          <img
            className="shape dots"
            src="/assets/images/shapes/contact-dots.png"
            alt="Shape"
          />
          <img
            className="shape wave-line"
            src="/assets/images/shapes/contact-wave-line.png"
            alt="Shape"
          />
        </div>
      </section>
      {/* FAQ Section start*/}

      <section className="faqs-area-area bgc-lighter py-130 rel z-1">
        <div className="container">
          <div className="row justify-content-between align-items-end pb-5">
            <div className="col-xl-6 col-lg-8 wow fadeInUp delay-0-2s">
              <div className="section-title mb-35">
                <span className="sub-title style-two mb-15">Faqs</span>
                <h2>Asked Questions about Website Design</h2>
              </div>
            </div>
            <div className="col-lg-4  text-lg-end wow rounded-1 fadeInUp delay-0-4s">
              <Link legacyBehavior href="/contact">
                <a
                  style={{ color: "#293043", fontWeight: "24px" }}
                  className="theme-btn style-three rounded-2 fs-6  mb-55 "
                >
                  Add Questions <i className="fas fa-angle-double-right" />
                </a>
              </Link>
            </div>
          </div>
          <Accordion
            defaultActiveKey="a0"
            className="accordion style-two"
            id="faq-accordion"
          >
            <div className="row">
              <div className="col-lg-6 rmb-20 wow fadeInUp delay-0-2s">
                {faqsData1.map((data, i) => (
                  <OxencyAccordion
                    key={i}
                    dec={t(data.dec)}
                    onClick={() => onClick(`a${i}`)}
                    active={active}
                    event={`a${i}`}
                    title={t(data.title)}
                  />
                ))}
              </div>
              <div className="col-lg-6 wow fadeInUp delay-0-4s">
                {faqsData2.map((data, i) => (
                  <OxencyAccordion
                    key={i}
                    dec={t(data.dec)}
                    onClick={() => onClick(`b${i}`)}
                    active={active}
                    event={`b${i}`}
                    title={t(data.title)}
                  />
                ))}
              </div>
            </div>
          </Accordion>
        </div>
      </section>

      {/* FAQ Section end*/}

      {/* Contact Area End */}
      {/* Blog Area start
          <section id="news" className="news-blog-area pt-130 pb-75 rel z-1">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="section-title text-center mb-60 wow fadeInUp delay-0-2s">
              <span className="sub-title mb-15">{t("news_section")}</span>
              <h2>{t("news_title")}</h2>
            </div>
          </div>
        </div>
        <div className="row large-gap">
          <div className="col-lg-6">
            <div className="blog-item wow fadeInUp delay-0-2s">
              <div className="image">
                <img src="/assets/images/blog/blog1.jpg" alt="Blog" />
              </div>
              <div className="content">
                <span className="date">
                  <i className="far fa-calendar-alt" /> {t("blog_1_date")}
                </span>
                <h4>
                  <Link legacyBehavior href="/blog-details">
                    <a>{t("blog_1_title")}</a>
                  </Link>
                </h4>
                <div className="author">
                  <img src="/assets/images/blog/author1.jpg" alt="Author" />
                  <div className="post-by">
                    <span>{t("post_by")}</span>
                    <a href="#">Douglas B. Dickens</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="blog-item wow fadeInUp delay-0-4s">
              <div className="image">
                <img src="/assets/images/blog/blog2.jpg" alt="Blog" />
              </div>
              <div className="content">
                <span className="date">
                  <i className="far fa-calendar-alt" /> {t("blog_2_date")}
                </span>
                <h4>
                  <Link legacyBehavior href="/blog-details">
                    <a>{t("blog_2_title")}</a>
                  </Link>
                </h4>
                <div className="author">
                  <img src="/assets/images/blog/author2.jpg" alt="Author" />
                  <div className="post-by">
                    <span>{t("post_by")}</span>
                    <a href="#">Carson C. Rhodes</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="blog-item wow fadeInUp delay-0-2s">
              <div className="image">
                <img src="/assets/images/blog/blog3.jpg" alt="Blog" />
              </div>
              <div className="content">
                <span className="date">
                  <i className="far fa-calendar-alt" /> {t("blog_3_date")}
                </span>
                <h4>
                  <Link legacyBehavior href="/blog-details">
                    <a>{t("blog_3_title")}</a>
                  </Link>
                </h4>
                <div className="author">
                  <img src="/assets/images/blog/author3.jpg" alt="Author" />
                  <div className="post-by">
                    <span>{t("post_by")}</span>
                    <a href="#">Robert T. Evans</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="blog-item wow fadeInUp delay-0-4s">
              <div className="image">
                <img src="/assets/images/blog/blog4.jpg" alt="Blog" />
              </div>
              <div className="content">
                <span className="date">
                  <i className="far fa-calendar-alt" /> {t("blog_4_date")}
                </span>
                <h4>
                  <Link legacyBehavior href="/blog-details">
                    <a>{t("blog_4_title")}</a>
                  </Link>
                </h4>
                <div className="author">
                  <img src="/assets/images/blog/author4.jpg" alt="Author" />
                  <div className="post-by">
                    <span>{t("post_by")}</span>
                    <a href="#">Stanley J. Contreras</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section> */}
    </Layout>
  );
};
export default IndexOnePage;
