document.addEventListener("DOMContentLoaded", function () {
    // Get references to the buttons and main content sections
    const roomsButton = document.querySelector(".rooms");
    const friendsButton = document.querySelector(".friends");
    const premiumButton = document.querySelector(".premium");
    const helpButton = document.querySelector(".help");
    const mainContents = document.querySelectorAll(".mainContent");

    // Add click event listeners to the buttons
    roomsButton.addEventListener("click", () => showContent("rooms"));
    friendsButton.addEventListener("click", () => showContent("friends"));
    premiumButton.addEventListener("click", () => showContent("premium"));
    helpButton.addEventListener("click", () => showContent("help"));

    // Function to show the selected content and update the URL
    function showContent(contentId) {
        mainContents.forEach(content => {
            content.style.display = "none";
        });

        const selectedContent = document.getElementById(`main-content-${contentId}`);
        if (selectedContent) {
            selectedContent.style.display = "block";
            // Update the URL with the fragment identifier
        }
    }

    // Check the URL on page load and show the corresponding content
    const initialHash = window.location.hash;
    if (initialHash) {
        const contentId = initialHash.substring(2); // Remove the leading "/#"
        showContent(contentId);
    } else {
        // Show the "Rooms" content by default
        showContent("rooms");
    }

    //lobby
    const getInActionBtn = document.getElementById("getInActionBtn");
    getInActionBtn.addEventListener("click", function () {
         // Redirect to the "lobby.html" page in the "Starter Template" folder
        window.location.href = "/lobby";
    });


    
});

$("#profile-update-form").submit(function (event) {
    event.preventDefault();

    const currentPassword = $("input[name='currentPassword']").val();
    const newPassword = $("input[name='newPassword']").val();
    const confirmPassword = $("input[name='confirmPassword']").val();
    
    const newUsername = $("input[name='newUsername']").val(); // Retrieve new username
    const newEmail = $("input[name='newEmail']").val(); // Retrieve new email

    // Check if at least one input field is filled
    if (!currentPassword && !newPassword && !confirmPassword && !newUsername && !newEmail) {
        alert("Please enter at least one updated detail (new username, new email, or new password).");
        return;
    }

    // Check if the new password and confirmation match
    if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match.");
        return;
    }

    $.post("/update-profile", { currentPassword, newPassword, confirmPassword, newUsername, newEmail }, function (data) {
        if (data.success) {
            alert(data.message);
            // Optionally, you can update the displayed username, email, and password on the page.
            if (newUsername) {
                $("#profileData p:first").text(newUsername);
            }
            if (newEmail) {
                $("#profileData p:eq(1)").text("Email: " + newEmail);
            }
            if (newPassword) {
                // You can decide how you want to display the password.
                // For security reasons, it's better not to display it on the page.
                // You can simply show a message like "Password updated successfully."
            }
        } else {
            alert(data.message);
        }
    });
});


$(document).ready(function() {
    // Select the checkbox and password fields div
    const updatePasswordCheckbox = $('#updatePassword');
    const passwordFields = $('#passwordFields');

    // Hide the password fields initially
    passwordFields.hide();

    // Listen for changes to the checkbox
    updatePasswordCheckbox.change(function() {
        if (updatePasswordCheckbox.is(':checked')) {
            // If the checkbox is checked, show the password fields
            passwordFields.show();
        } else {
            // If the checkbox is unchecked, hide the password fields
            passwordFields.hide();
        }
    });
});