Name:     nginx-http-sync
Version:	1.0.0
Release:	1%{?dist}
Summary:	awesome project

Group:		Applications/System
License:	GPL-2.0
URL:		  
Source0:	%{name}-%{version}.tar.gz

BuildRequires: npm git
Requires:	    nodejs

BuildRoot:  %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
BuildArch:	noarch

%description
sync local dir with NGINX autoindex


%prep
%setup -q -n %{name}-%{version}


%build
npm install

%install
test "x$RPM_BUILD_ROOT" != "x" && rm -rf $RPM_BUILD_ROOT
mkdir -p %{buildroot}/%{_datadir}/%{name}


cp -av lib/ %{buildroot}/%{_datadir}/%{name}

cp config.js %{buildroot}/%{_datadir}/%{name}
cp index.js %{buildroot}/%{_datadir}/%{name}
cp package.json %{buildroot}/%{_datadir}/%{name}
cp service.js %{buildroot}/%{_datadir}/%{name}

mkdir -p %{buildroot}/%{_sysconfdir}/%{name}
install -Dp -m 644 config.js.editme %{buildroot}/%{_sysconfdir}/%{name}/config.js
ln -sf %{_sysconfdir}/%{name}/config.js %{buildroot}/%{_datadir}/%{name}/config.js



%changelog
