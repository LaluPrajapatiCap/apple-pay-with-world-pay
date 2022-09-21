import React, { useState, useEffect } from "react";
import Button from "../Button/button";

import "./apple-pay-button.css";

const ApplePayButton = () => {
  const [showAppleButton, setShowAppleButton] = useState(false); //

  const validateApplePayButtonOnBrowser = () => {
    if (window.ApplePaySession) {
      // validate wether device support apple pay
      const result = window.ApplePaySession.canMakePayment();
      if (result) {
        setShowAppleButton(true);
      }

      // validate whether the user has an active card in Wallet with apple pay supported device
      const merchantIdentifier = "example.com.store";
      const result1 =
        window.ApplePaySession.canMakePaymentsWithActiveCard(
          merchantIdentifier
        );
      result1.then(function (canMakePayments) {
        if (canMakePayments) {
          setShowAppleButton(true);
        }
      });
    }
  };

  const handleAppleSession = () => {
    const versionNumber = 12;
    const paymentRequest = {
      countryCode: "US",
      currencyCode: "USD",
      supportedNetworks: ["visa", "masterCard", "amex", "discover"],
      merchantCapabilities: ["supports3DS"],
      total: {
        label: "Discount Tire",
        amount: "10.00",
      },
    };

    const session = new ApplePaySession(versionNumber, paymentRequest);

    // merchant validation to authenticate from device (applewatch/iphone/Mac etc.)
    session.onvalidatemerchant = (event) => {
      console.log("onvalidatemerchant", event);
      const data = {
        validationURL: event.validationURL,
      };
      fetch("/validation-resource-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((res) => {
          console.log("getApplePaySession", res);
          session.completeMerchantValidation(res);
        })
        .catch((error) => {
          console.error("getApplePaySessionError", error);
        });
    };

    // Payment Athorization and send data to payment provider and return status
    session.onpaymentauthorized = (event) => {
      console.log("onpaymentauthorized", event);
      const payment = event.payment;
      const { billingContact, shippingContact, token } = payment;
      const paymentData = {
        billingContact,
        shippingContact,
        token: token.paymentData,
      };
      fetch("/payment-processing-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })
        .then((response) => response.json())
        .then((res) => {
          console.log("onpaymentauthorizedSuccess", res);
          session.completePayment(
            res.success // will be replaced by actual key from response
              ? ApplePaySession.STATUS_SUCCESS
              : ApplePaySession.STATUS_FAILURE
          );
        })
        .catch((error) => {
          console.error("onpaymentauthorizedError", error);
        });
    };

    session.begin(); //
  };

  useEffect(() => {
    validateApplePayButtonOnBrowser();
    return () => {};
  }, []);

  return (
    <div className="apple-pay-button-container">
      {showAppleButton && (
        <Button ariaLabel="Apple Pay" styleName="apple-pay-button" />
      )}
    </div>
  );
};

export default ApplePayButton;
