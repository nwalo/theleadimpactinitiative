$(() => {
  $("#join-us-form").on("submit", function (e) {
    e.preventDefault();

    const data = {
      email: $("#email").val(),
      fullName: $("#fullName").val(),
      phone: $("#phone").val(),
    };
    $("#msg").html(``);

    const sendData = async () => {
      try {
        const res = await axios.post("/join", data);
        console.log(res);
        if (res.data.status) {
          $("#msg").html(`Thanks for volunteering...`);
          $("#msg").css({ color: "green" });
        } else {
          $("#msg").html(`Oopsies... Already volunteered.`);
          $("#msg").css({ color: "red" });
        }
      } catch (error) {
        console.log(error);
        $("#msg").html(`<p>Error... unable to complete</p>`);
        $("#msg").css({ color: "red" });
      }
    };

    sendData();
  });

  $("#contact").on("submit", function (e) {
    e.preventDefault();

    const data = {
      email: $("#email").val(),
      fullName: $("#fullName").val(),
      phone: $("#phone").val(),
      subject: $("#subject").val(),
      message: $("#message").val(),
    };

    $("#msg").html(``);

    console.log(data);

    const sendData = async () => {
      try {
        const res = await axios.post("/contacts", data);
        console.log(res);
        if (res.data.status) {
          $("#msg").html(`Thanks for reaching out to us...`);
          $("#msg").css({ color: "green" });
        } else {
          $("#msg").html(`Error... Your message was not sent.`);
          $("#msg").css({ color: "red" });
        }
      } catch (error) {
        console.log(error);
        $("#msg").html(`<p>Error... unable to complete</p>`);
        $("#msg").css({ color: "red" });
      }
    };

    sendData();
  });
});
