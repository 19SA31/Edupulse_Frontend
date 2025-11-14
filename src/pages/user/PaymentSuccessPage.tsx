import Header from "../../components/common/Header";
import PaymentSuccess from "../../components/user/PaymentSuccess";
import { verifyPayment } from "../../services/userService";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const courseId = params.courseId;
  const sessionId = searchParams.get("session_id");
  const paymentParam = searchParams.get("payment");

  return (

    <PaymentSuccess
      courseId={courseId}
      sessionId={sessionId}
      paymentParam={paymentParam}
      verifyPayment={verifyPayment}
      onNavigate={navigate}
    />
  );
}

export default PaymentSuccessPage;