import React from 'react';

const CopyrightPage = () => {
  const year = new Date().getFullYear();

  return (
    <div className="copyright-page route-wrapper">
      <h2 className="copyright-page-title">Copyright &amp; Image Rights</h2>

      <div className="copyright-page-body">

        <section className="copyright-section">
          <h3>Ownership</h3>
          <p>
            All photographs published on this website are &copy; {year} Toronto Graffiti Archive.
            All rights are reserved. The images, their compilation, and the manner in which they
            are presented are protected under Canadian and international copyright law.
          </p>
        </section>

        <section className="copyright-section">
          <h3>What You May Not Do</h3>
          <ul>
            <li>Download, save, or copy any image from this site</li>
            <li>Reproduce, redistribute, or publish any image — in print or digitally</li>
            <li>Use any image for commercial purposes, advertising, or editorial use</li>
            <li>Remove or obscure any watermark or copyright notice</li>
            <li>Share or post any image on social media without written permission</li>
          </ul>
        </section>

        <section className="copyright-section">
          <h3>What You May Do</h3>
          <ul>
            <li>Browse and view images on this site for personal enjoyment</li>
            <li>Share a link to this website or to a specific photo page</li>
          </ul>
        </section>

        <section className="copyright-section">
          <h3>Purchasing &amp; Licensing</h3>
          <p>
            High-resolution prints and image licenses are available for purchase.
            If you are interested in acquiring a print or licensing an image for
            editorial, commercial, or personal use, please get in touch.
          </p>
          <a
            href="mailto:contact@torontograff.com"
            className="copyright-contact-link"
          >
            contact@torontograff.com
          </a>
        </section>

        <section className="copyright-section">
          <h3>Takedown Requests</h3>
          <p>
            If you believe an image on this site infringes your rights or the rights
            of a third party, please contact us at{' '}
            <a href="mailto:contact@torontograff.com" className="copyright-inline-link">
              contact@torontograff.com
            </a>{' '}
            and we will respond promptly.
          </p>
        </section>

        <p className="copyright-footer">
          &copy; {year} Toronto Graffiti Archive — All Rights Reserved
        </p>

      </div>
    </div>
  );
};

export default CopyrightPage;
